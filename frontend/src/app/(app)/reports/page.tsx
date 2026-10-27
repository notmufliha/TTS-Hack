"use client";

import { useEffect, useState } from "react";
import { currentMonth, formatDateTime, formatMinutes, referralOutcome } from "@/lib/format";
import type { MonthlyReport } from "@/lib/types";
import { reportsAPI } from "../../components/api";
import {
  buttonStyles,
  Card,
  EmptyState,
  ErrorBanner,
  icons,
  OutcomeBadge,
  PageHeader,
  Spinner,
  StatTile,
  tableStyles,
} from "../../components/ui";

function downloadCsv(report: MonthlyReport) {
  const header = [
    "Order ID",
    "Referral ID",
    "Provider",
    "Community Hospital",
    "Ward Type",
    "Referred",
    "Screened",
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
    r.ward_type ?? "",
    formatDateTime(r.order_datetime),
    formatDateTime(r.reviewed_datetime),
    formatDateTime(r.accepted_withdrawn_datetime),
    referralOutcome(r),
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

  const t = report?.totals;
  const tat = report?.tat_minutes;

  return (
    <>
      <PageHeader
        title="Monthly report"
        description="Referral outcomes and turnaround times, by referral date. No patient identifiers are included."
        actions={
          <>
            <input
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              aria-label="Month"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            />
            <button
              onClick={() => report && downloadCsv(report)}
              disabled={!report || report.rows.length === 0}
              className={buttonStyles.primary}
            >
              <icons.download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => window.print()} className={buttonStyles.secondary}>
              Print
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading && !report ? (
        <Spinner label="Loading report…" />
      ) : (
        report &&
        t &&
        tat && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                label="Referrals"
                value={String(t.referrals)}
                detail={`${t.accepted} accepted · ${t.rejected} rejected · ${t.withdrawn_or_cancelled} withdrawn`}
              />
              <StatTile
                label="Median referral → decision"
                value={formatMinutes(tat.order_to_decision_median)}
                detail={`Average ${formatMinutes(tat.order_to_decision_avg)}`}
              />
              <StatTile label="Average referral → screening" value={formatMinutes(tat.order_to_review_avg)} />
              <StatTile
                label="Staff time saved (est.)"
                value={formatMinutes(report.time_saved_minutes)}
                detail={`${t.escalated} awaiting clinician · ${t.pending} not yet screened`}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card title="Rejection reasons">
                {report.rejection_reasons.length === 0 ? (
                  <p className="text-sm text-slate-500">No rejections this month.</p>
                ) : (
                  <ol className="space-y-2">
                    {report.rejection_reasons.map((r) => (
                      <li key={r.reason} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-slate-700">{r.reason}</span>
                        <span className="font-semibold tabular-nums text-slate-900">{r.count}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
              <Card title="How time saved is estimated" className="lg:col-span-2">
                <p className="text-sm text-slate-600">
                  The manual process takes about 6 minutes of review and 2 minutes of transcription per case (ICH PSO
                  brief). A referral decided automatically saves both. A referral escalated to the screening clinician
                  still needs review, so it saves the transcription only. Turnaround is measured from the referral
                  order time to the accept or reject time recorded on the order.
                </p>
              </Card>
            </div>

            <Card title={`Referrals in ${report.month}`} padded={false}>
              {report.rows.length === 0 ? (
                <EmptyState title={`No referrals in ${report.month}`} />
              ) : (
                <div className="overflow-x-auto">
                  <table className={tableStyles.table}>
                    <thead className="bg-slate-50">
                      <tr>
                        {["Referral", "Source", "Referred", "Decided", "Turnaround", "Outcome", "Reason"].map((h) => (
                          <th key={h} className={tableStyles.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {report.rows.map((r) => (
                        <tr key={r.order_id}>
                          <td className={`${tableStyles.td} font-medium text-slate-900`}>{r.referral_id}</td>
                          <td className={tableStyles.td}>{r.provider}</td>
                          <td className={`${tableStyles.td} whitespace-nowrap`}>{formatDateTime(r.order_datetime)}</td>
                          <td className={`${tableStyles.td} whitespace-nowrap`}>
                            {formatDateTime(r.accepted_withdrawn_datetime)}
                          </td>
                          <td className={`${tableStyles.td} tabular-nums`}>{formatMinutes(r.tat_minutes)}</td>
                          <td className={tableStyles.td}>
                            <OutcomeBadge outcome={referralOutcome(r)} />
                          </td>
                          <td className={`${tableStyles.td} max-w-xs text-xs`}>{r.rejected_reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )
      )}
    </>
  );
}
