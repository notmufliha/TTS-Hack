"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import { formatMinutes } from "../dashboard/components/StatsOverview";
import { reportsAPI } from "../components/api";
import type { MonthlyReport } from "@/lib/types";

const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit" }).format(
    new Date()
  );

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-SG", { timeZone: "Asia/Singapore", hour12: false }) : "";

function outcome(row: MonthlyReport["rows"][number]) {
  if (row.referral_status === "Pending" && row.case_escalated_to_clinician) return "Escalated";
  return row.referral_status;
}

function downloadCsv(report: MonthlyReport) {
  const header = [
    "Order ID",
    "Referral ID",
    "Provider",
    "Community Hospital",
    "Referred",
    "Reviewed",
    "Decided",
    "Outcome",
    "Escalated to Clinician",
    "TAT Referral to Decision (min)",
    "Rejection Reason",
    "PSA",
  ];
  const rows = report.rows.map((r) => [
    r.order_id,
    r.referral_id,
    r.provider ?? "",
    r.community_hospital ?? "",
    formatDateTime(r.order_datetime),
    formatDateTime(r.reviewed_datetime),
    formatDateTime(r.accepted_withdrawn_datetime),
    outcome(r),
    r.case_escalated_to_clinician ? "Yes" : "No",
    r.tat_minutes === null ? "" : Math.round(r.tat_minutes),
    r.rejected_reason ?? "",
    r.psa_name ?? "",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `ICH_Referral_Report_${report.month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    reportsAPI
      .monthly(month)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [month]);

  const totals = report?.totals;
  const cards = report
    ? [
        { label: "Referrals", value: String(totals!.referrals) },
        { label: "Accepted", value: String(totals!.accepted) },
        { label: "Rejected", value: String(totals!.rejected) },
        { label: "Escalated (awaiting clinician)", value: String(totals!.escalated) },
        { label: "Not yet screened", value: String(totals!.pending) },
        { label: "Withdrawn / cancelled", value: String(totals!.withdrawn_or_cancelled) },
        { label: "Avg. referral → review", value: formatMinutes(report.tat_minutes.order_to_review_avg) },
        { label: "Avg. referral → decision", value: formatMinutes(report.tat_minutes.order_to_decision_avg) },
        { label: "Median referral → decision", value: formatMinutes(report.tat_minutes.order_to_decision_median) },
        { label: "Staff time saved (est.)", value: formatMinutes(report.time_saved_minutes) },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Monthly Referral Report</h2>
            <p className="text-sm text-gray-500">Referral outcomes and turnaround times, by referral date</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
            />
            <button
              onClick={() => report && downloadCsv(report)}
              disabled={!report || report.rows.length === 0}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Print
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">{error}</div>}
        {loading && !report && <div className="text-gray-500">Loading report…</div>}

        {report && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-lg shadow p-4">
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Time saved assumes the manual process takes 6 min of review and 2 min of transcription per case. Cases
              decided automatically save both. Cases escalated to a clinician save the transcription only.
            </p>

            {report.rejection_reasons.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Rejection reasons</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {report.rejection_reasons.map((r) => (
                    <li key={r.reason} className="flex justify-between max-w-md">
                      <span>{r.reason}</span>
                      <span className="font-semibold">{r.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Order", "Referral", "Provider", "Referred", "Decided", "Outcome", "TAT", "Reason"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No referrals in {report.month}
                      </td>
                    </tr>
                  ) : (
                    report.rows.map((r) => (
                      <tr key={r.order_id}>
                        <td className="px-4 py-2 text-gray-900">#{r.order_id}</td>
                        <td className="px-4 py-2 text-gray-900">{r.referral_id}</td>
                        <td className="px-4 py-2 text-gray-700">{r.provider}</td>
                        <td className="px-4 py-2 text-gray-700">{formatDateTime(r.order_datetime)}</td>
                        <td className="px-4 py-2 text-gray-700">{formatDateTime(r.accepted_withdrawn_datetime)}</td>
                        <td className="px-4 py-2 text-gray-900">{outcome(r)}</td>
                        <td className="px-4 py-2 text-gray-700">{formatMinutes(r.tat_minutes)}</td>
                        <td className="px-4 py-2 text-gray-700">{r.rejected_reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
