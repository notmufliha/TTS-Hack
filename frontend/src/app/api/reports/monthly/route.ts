import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/api-route";
import type { MonthlyReport } from "@/lib/types";

export const dynamic = "force-dynamic";

// Baseline manual effort per case from the ICH PSO brief.
const MANUAL_REVIEW_MINUTES = 6;
const MANUAL_TRANSCRIPTION_MINUTES = 2;

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// GET /api/reports/monthly?month=YYYY-MM  (defaults to the current month in Singapore)
export async function GET(request: Request) {
  try {
    const param = new URL(request.url).searchParams.get("month");
    const month =
      param ??
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit" }).format(
        new Date()
      );
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new HttpError(400, "month must be YYYY-MM");

    const result = await pool.query(
      `SELECT ro.*, p.patient_name, p.nric, p.age, p.gender,
              EXTRACT(EPOCH FROM (ro.reviewed_datetime - ro.order_datetime)) / 60 AS review_minutes,
              EXTRACT(EPOCH FROM (ro.accepted_withdrawn_datetime - ro.order_datetime)) / 60 AS tat_minutes
       FROM referral_order ro
       LEFT JOIN patient p ON ro.patient_id = p.patient_id
       WHERE ro.order_datetime >= $1::date
         AND ro.order_datetime < ($1::date + INTERVAL '1 month')
       ORDER BY ro.order_datetime`,
      [`${month}-01`]
    );

    const rows = result.rows.map((r) => ({
      ...r,
      review_minutes: r.review_minutes === null ? null : Number(r.review_minutes),
      tat_minutes: r.tat_minutes === null ? null : Number(r.tat_minutes),
    }));

    const escalated = rows.filter((r) => r.referral_status === "Pending" && r.case_escalated_to_clinician);
    const decided = rows.filter(
      (r) => (r.referral_status === "Accepted" || r.referral_status === "Rejected") && r.tat_minutes !== null
    );
    const decisionTimes = decided.map((r) => r.tat_minutes as number).filter((n) => n >= 0);
    const reviewTimes = rows.map((r) => r.review_minutes).filter((n): n is number => n !== null && n >= 0);

    // A case decided without a clinician saves the whole manual review and
    // transcription. A case escalated to a clinician still saves the transcription.
    const timeSaved = rows
      .filter((r) => r.reviewed_datetime && r.referral_status !== "Withdrawn" && r.referral_status !== "Cancelled")
      .reduce(
        (total, r) =>
          total +
          (r.case_escalated_to_clinician
            ? MANUAL_TRANSCRIPTION_MINUTES
            : MANUAL_REVIEW_MINUTES + MANUAL_TRANSCRIPTION_MINUTES),
        0
      );

    const reasonCounts = new Map<string, number>();
    for (const r of rows) {
      if (r.referral_status !== "Rejected" || !r.rejected_reason) continue;
      for (const reason of String(r.rejected_reason).split(";")) {
        const key = reason.split(":")[0].trim();
        if (key) reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
      }
    }

    const report: MonthlyReport = {
      month,
      totals: {
        referrals: rows.length,
        accepted: rows.filter((r) => r.referral_status === "Accepted").length,
        rejected: rows.filter((r) => r.referral_status === "Rejected").length,
        escalated: escalated.length,
        pending: rows.filter((r) => r.referral_status === "Pending" && !r.case_escalated_to_clinician).length,
        withdrawn_or_cancelled: rows.filter(
          (r) => r.referral_status === "Withdrawn" || r.referral_status === "Cancelled"
        ).length,
      },
      tat_minutes: {
        order_to_review_avg: average(reviewTimes),
        order_to_decision_avg: average(decisionTimes),
        order_to_decision_median: median(decisionTimes),
      },
      time_saved_minutes: timeSaved,
      rejection_reasons: [...reasonCounts.entries()]
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
      rows,
    };

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return errorResponse(error);
  }
}
