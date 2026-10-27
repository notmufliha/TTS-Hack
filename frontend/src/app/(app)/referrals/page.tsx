"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime, formatRelative, maskNric, type Outcome, referralOutcome } from "@/lib/format";
import type { ReferralOrder } from "@/lib/types";
import { referralOrdersAPI } from "../../components/api";
import { ReferralDrawer, referralFlags } from "../../components/ReferralDrawer";
import {
  buttonStyles,
  Card,
  Chip,
  EmptyState,
  ErrorBanner,
  icons,
  OutcomeBadge,
  PageHeader,
  SearchInput,
  Spinner,
  tableStyles,
  Tabs,
} from "../../components/ui";

type Filter = "To screen" | "Escalated" | "Accepted" | "Rejected" | "All";

const FILTERS: { value: Filter; label: string; matches: (o: Outcome) => boolean }[] = [
  { value: "To screen", label: "To screen", matches: (o) => o === "To screen" },
  { value: "Escalated", label: "Awaiting clinician", matches: (o) => o === "Escalated" },
  { value: "Accepted", label: "Accepted", matches: (o) => o === "Accepted" },
  { value: "Rejected", label: "Rejected", matches: (o) => o === "Rejected" },
  { value: "All", label: "All", matches: () => true },
];

export default function ReferralQueuePage() {
  const [orders, setOrders] = useState<ReferralOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("To screen");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ order: ReferralOrder; autoScreen: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await referralOrdersAPI.getAll();
      setOrders(res.referralOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { "To screen": 0, Escalated: 0, Accepted: 0, Rejected: 0, All: orders.length };
    for (const o of orders) {
      const outcome = referralOutcome(o);
      if (outcome in c) c[outcome as Filter]++;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.value === filter)!;
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => f.matches(referralOutcome(o)))
      .filter(
        (o) =>
          !q ||
          [o.patient_name, o.nric, o.referral_id, o.provider, String(o.order_id)].some((v) =>
            String(v ?? "").toLowerCase().includes(q)
          )
      )
      .sort((a, b) => {
        // Oldest first for work queues, newest first for history.
        const diff = new Date(a.order_datetime).getTime() - new Date(b.order_datetime).getTime();
        return filter === "To screen" || filter === "Escalated" ? diff : -diff;
      });
  }, [orders, filter, query]);

  return (
    <>
      <PageHeader
        title="Referral queue"
        description="Screen new referrals against the ICH readiness checklist. Unclear cases go to the screening clinician."
        actions={
          <button onClick={load} className={buttonStyles.secondary}>
            <icons.refresh className="h-4 w-4" /> Refresh
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={FILTERS.map((f) => ({ value: f.value, label: f.label, count: counts[f.value] }))}
          value={filter}
          onChange={setFilter}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, NRIC, referral ID" />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={load} />
        </div>
      )}

      <Card padded={false}>
        {loading ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState
            title={filter === "To screen" ? "No referrals waiting to be screened" : "No referrals here"}
            description={query ? "Try a different search." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={tableStyles.th}>Referral</th>
                  <th className={tableStyles.th}>Patient</th>
                  <th className={`${tableStyles.th} hidden lg:table-cell`}>Source</th>
                  <th className={`${tableStyles.th} hidden xl:table-cell`}>Referral flags</th>
                  <th className={tableStyles.th}>Status</th>
                  <th className={tableStyles.th}>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visible.map((order) => {
                  const outcome = referralOutcome(order);
                  const flags = referralFlags(order);
                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50/70">
                      <td className={tableStyles.td}>
                        <p className="font-medium text-slate-900">{order.referral_id}</p>
                        <p className="text-xs text-slate-500" title={formatDateTime(order.order_datetime)}>
                          {formatRelative(order.order_datetime)}
                        </p>
                      </td>
                      <td className={tableStyles.td}>
                        <p className="font-medium text-slate-900">{order.patient_name ?? `Patient ${order.patient_id}`}</p>
                        <p className="text-xs text-slate-500">
                          {[order.age && `${order.age}`, order.gender?.[0], maskNric(order.nric)].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      <td className={`${tableStyles.td} hidden lg:table-cell`}>
                        <p className="text-slate-900">{order.provider ?? "—"}</p>
                        <p className="text-xs text-slate-500">{order.ward_type}</p>
                      </td>
                      <td className={`${tableStyles.td} hidden xl:table-cell`}>
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {flags.length === 0 ? (
                            <span className="text-xs text-slate-400">None</span>
                          ) : (
                            flags.map((f) => (
                              <Chip key={f} tone="rose">
                                {f}
                              </Chip>
                            ))
                          )}
                        </div>
                      </td>
                      <td className={tableStyles.td}>
                        <OutcomeBadge outcome={outcome} />
                      </td>
                      <td className={`${tableStyles.td} text-right`}>
                        {outcome === "To screen" ? (
                          <button
                            onClick={() => setSelected({ order, autoScreen: true })}
                            className={buttonStyles.primary}
                          >
                            Screen
                          </button>
                        ) : outcome === "Escalated" ? (
                          <button
                            onClick={() => setSelected({ order, autoScreen: false })}
                            className={buttonStyles.attention}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelected({ order, autoScreen: false })}
                            className={buttonStyles.secondary}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <ReferralDrawer
          key={selected.order.order_id}
          order={selected.order}
          autoScreen={selected.autoScreen}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </>
  );
}
