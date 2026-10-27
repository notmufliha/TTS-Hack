"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { currentMonth, formatMinutes, formatRelative, referralOutcome } from "@/lib/format";
import type { MonthlyReport, ReferralOrder } from "@/lib/types";
import { referralOrdersAPI, reportsAPI } from "../../components/api";
import { buttonStyles, Card, EmptyState, ErrorBanner, icons, OutcomeBadge, PageHeader, Spinner, StatTile } from "../../components/ui";

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [orders, setOrders] = useState<ReferralOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    referralOrdersAPI
      .getAll()
      .then((res) => setOrders(res.referralOrders))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    setReport(null);
    reportsAPI
      .monthly(month)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [month]);

  const needsAttention = (orders ?? [])
    .filter((o) => ["To screen", "Escalated"].includes(referralOutcome(o)))
    .sort((a, b) => new Date(a.order_datetime).getTime() - new Date(b.order_datetime).getTime());

  const recentDecisions = (orders ?? [])
    .filter((o) => o.accepted_withdrawn_datetime && ["Accepted", "Rejected"].includes(o.referral_status))
    .sort(
      (a, b) =>
        new Date(b.accepted_withdrawn_datetime!).getTime() - new Date(a.accepted_withdrawn_datetime!).getTime()
    )
    .slice(0, 5);

  const t = report?.totals;
  const outcomeRows = t
    ? [
        { label: "Accepted", value: t.accepted },
        { label: "Rejected", value: t.rejected },
        { label: "Awaiting clinician", value: t.escalated },
        { label: "Not yet screened", value: t.pending },
        { label: "Withdrawn / cancelled", value: t.withdrawn_or_cancelled },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today's queue and this month's referral performance."
        actions={
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Month"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          />
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Waiting for action"
          value={orders ? String(needsAttention.length) : "…"}
          detail={
            orders
              ? `${needsAttention.filter((o) => referralOutcome(o) === "Escalated").length} with the screening clinician`
              : undefined
          }
        />
        <StatTile
          label="Referrals this month"
          value={t ? String(t.referrals) : "…"}
          detail={t ? `${t.accepted} accepted · ${t.rejected} rejected` : undefined}
        />
        <StatTile
          label="Median referral → decision"
          value={report ? formatMinutes(report.tat_minutes.order_to_decision_median) : "…"}
          detail={report ? `Average ${formatMinutes(report.tat_minutes.order_to_decision_avg)}` : undefined}
        />
        <StatTile
          label="Staff time saved (est.)"
          value={report ? formatMinutes(report.time_saved_minutes) : "…"}
          detail="vs. 8 min of manual review and transcription per case"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          padded={false}
          title="Needs attention"
          action={
            <Link href="/referrals" className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900">
              Open queue <icons.arrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {!orders ? (
            <Spinner />
          ) : needsAttention.length === 0 ? (
            <EmptyState title="All caught up" description="No referrals are waiting to be screened or reviewed." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {needsAttention.slice(0, 8).map((o) => (
                <li key={o.order_id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {o.patient_name ?? `Patient ${o.patient_id}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.referral_id} · {o.provider} · received {formatRelative(o.order_datetime)}
                    </p>
                  </div>
                  <OutcomeBadge outcome={referralOutcome(o)} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Outcomes this month">
          {!report ? (
            <Spinner />
          ) : t!.referrals === 0 ? (
            <EmptyState title="No referrals this month" />
          ) : (
            <dl className="space-y-3">
              {outcomeRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between text-sm">
                  <dt className="text-slate-600">{row.label}</dt>
                  <dd className="tabular-nums text-slate-900">
                    <span className="font-semibold">{row.value}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {Math.round((row.value / t!.referrals) * 100)}%
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <Card className="lg:col-span-2" padded={false} title="Recent decisions">
          {!orders ? (
            <Spinner />
          ) : recentDecisions.length === 0 ? (
            <EmptyState title="No decisions yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDecisions.map((o) => (
                <li key={o.order_id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {o.patient_name ?? `Patient ${o.patient_id}`}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {o.referral_id} · {formatRelative(o.accepted_withdrawn_datetime)}
                      {o.rejected_reason ? ` · ${o.rejected_reason}` : ""}
                    </p>
                  </div>
                  <OutcomeBadge outcome={referralOutcome(o)} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Top rejection reasons"
          action={
            <Link href="/reports" className="text-sm font-medium text-sky-700 hover:text-sky-900">
              Full report
            </Link>
          }
        >
          {!report ? (
            <Spinner />
          ) : report.rejection_reasons.length === 0 ? (
            <p className="text-sm text-slate-500">No rejections this month.</p>
          ) : (
            <ol className="space-y-2">
              {report.rejection_reasons.slice(0, 5).map((r) => (
                <li key={r.reason} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-slate-700">{r.reason}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{r.count}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/referrals" className={buttonStyles.primary}>
          Screen referrals
        </Link>
        <Link href="/reports" className={buttonStyles.secondary}>
          Monthly report
        </Link>
      </div>
    </>
  );
}
