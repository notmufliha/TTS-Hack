"use client";

import { useMemo, useState } from "react";
import { formatDateTime, maskNric } from "@/lib/format";
import { assessExclusions, assessVitals, classifyImaging } from "@/lib/screening";
import type { CriterionStatus } from "@/lib/types";
import { useApiData } from "../../components/useApiData";
import {
  Card,
  Chip,
  EmptyState,
  ErrorBanner,
  icons,
  PageHeader,
  SearchInput,
  Spinner,
  tableStyles,
  Tabs,
} from "../../components/ui";

type Tab = "patients" | "medical" | "appointments" | "swabs";

const VITAL_TONE: Record<CriterionStatus, string> = {
  PASS: "text-slate-900",
  FAIL: "font-semibold text-rose-700",
  REVIEW: "font-semibold text-amber-700",
};

function matches(query: string, ...values: unknown[]) {
  const q = query.trim().toLowerCase();
  return !q || values.some((v) => String(v ?? "").toLowerCase().includes(q));
}

export default function RecordsPage() {
  const { data, loading, error, refetch } = useApiData();
  const [tab, setTab] = useState<Tab>("patients");
  const [query, setQuery] = useState("");

  const patients = useMemo(
    () => data.patients.filter((p) => matches(query, p.patient_name, p.nric, p.patient_id)),
    [data.patients, query]
  );
  const histories = useMemo(
    () => data.medicalHistories.filter((h) => matches(query, h.patient_name, h.patient_id)),
    [data.medicalHistories, query]
  );
  const appointments = useMemo(
    () => data.appointments.filter((a) => matches(query, a.patient_name, a.appointment_type, a.patient_id)),
    [data.appointments, query]
  );
  const swabs = useMemo(
    () => data.swabs.filter((s) => matches(query, s.patient_name, s.swab_type, s.patient_id)),
    [data.swabs, query]
  );

  return (
    <>
      <PageHeader
        title="Records"
        description="Mock EPIC data used by screening. Read-only view of fake demo patients."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "patients", label: "Patients", count: patients.length },
            { value: "medical", label: "Medical history", count: histories.length },
            { value: "appointments", label: "Appointments", count: appointments.length },
            { value: "swabs", label: "Swabs", count: swabs.length },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or ID" />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={refetch} />
        </div>
      )}

      <Card padded={false}>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            {tab === "patients" &&
              (patients.length === 0 ? (
                <EmptyState title="No patients found" />
              ) : (
                <table className={tableStyles.table}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={tableStyles.th}>ID</th>
                      <th className={tableStyles.th}>Name</th>
                      <th className={tableStyles.th}>NRIC</th>
                      <th className={tableStyles.th}>Age</th>
                      <th className={tableStyles.th}>Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {patients.map((p) => (
                      <tr key={p.patient_id}>
                        <td className={`${tableStyles.td} tabular-nums text-slate-500`}>{p.patient_id}</td>
                        <td className={`${tableStyles.td} font-medium text-slate-900`}>{p.patient_name}</td>
                        <td className={`${tableStyles.td} font-mono text-xs`}>{maskNric(p.nric)}</td>
                        <td className={`${tableStyles.td} tabular-nums`}>{p.age}</td>
                        <td className={tableStyles.td}>{p.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === "medical" &&
              (histories.length === 0 ? (
                <EmptyState title="No medical history found" />
              ) : (
                <table className={tableStyles.table}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={tableStyles.th}>Patient</th>
                      <th className={tableStyles.th}>Conditions</th>
                      <th className={tableStyles.th}>Vitals</th>
                      <th className={tableStyles.th}>Notes</th>
                      <th className={tableStyles.th}>Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {histories.map((h) => {
                      const conditions = assessExclusions(h).filter((c) => c.status !== "PASS");
                      const vitals = assessVitals(h);
                      return (
                        <tr key={h.history_id}>
                          <td className={`${tableStyles.td} min-w-36`}>
                            <p className="font-medium text-slate-900">{h.patient_name ?? `Patient ${h.patient_id}`}</p>
                            <p className="text-xs text-slate-500">
                              ID {h.patient_id}
                              {h.age ? ` · ${h.age} yrs` : ""}
                            </p>
                          </td>
                          <td className={tableStyles.td}>
                            <div className="flex max-w-56 flex-wrap gap-1">
                              {conditions.length === 0 ? (
                                <span className="text-xs text-slate-400">None</span>
                              ) : (
                                conditions.map((c) => (
                                  <Chip key={c.key} tone="rose">
                                    {c.key === "tracheostomy_freq" ? "Frequent trach suctioning" : c.label}
                                  </Chip>
                                ))
                              )}
                            </div>
                          </td>
                          <td className={tableStyles.td}>
                            <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-xs">
                              {vitals.map((v) => (
                                <div key={v.key} className="contents">
                                  <dt className="whitespace-nowrap text-slate-500">{v.label}</dt>
                                  <dd className={`whitespace-nowrap tabular-nums ${VITAL_TONE[v.status]}`}>
                                    {v.actual.split(" (")[0]}
                                    {v.status !== "PASS" && (
                                      <span className="sr-only"> ({v.status === "FAIL" ? "out of range" : "needs review"})</span>
                                    )}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </td>
                          <td className={`${tableStyles.td} max-w-48 text-xs`}>{h.special_circumstance || "—"}</td>
                          <td className={`${tableStyles.td} whitespace-nowrap text-xs`}>{formatDateTime(h.last_updated)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}

            {tab === "appointments" &&
              (appointments.length === 0 ? (
                <EmptyState title="No appointments found" />
              ) : (
                <table className={tableStyles.table}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={tableStyles.th}>Patient</th>
                      <th className={tableStyles.th}>Type</th>
                      <th className={tableStyles.th}>Date</th>
                      <th className={tableStyles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {appointments.map((a) => (
                      <tr key={a.appointment_id}>
                        <td className={tableStyles.td}>
                          <p className="font-medium text-slate-900">{a.patient_name ?? `Patient ${a.patient_id}`}</p>
                          <p className="text-xs text-slate-500">ID {a.patient_id}</p>
                        </td>
                        <td className={tableStyles.td}>
                          <span className="flex flex-wrap items-center gap-2">
                            {a.appointment_type}
                            {classifyImaging(a.appointment_type || "") && <Chip tone="amber">Imaging</Chip>}
                          </span>
                        </td>
                        <td className={`${tableStyles.td} whitespace-nowrap`}>{formatDateTime(a.appointment_date)}</td>
                        <td className={tableStyles.td}>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === "swabs" &&
              (swabs.length === 0 ? (
                <EmptyState title="No swabs found" />
              ) : (
                <table className={tableStyles.table}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={tableStyles.th}>Patient</th>
                      <th className={tableStyles.th}>Swab</th>
                      <th className={tableStyles.th}>Taken</th>
                      <th className={tableStyles.th}>Result</th>
                      <th className={tableStyles.th}>Site</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {swabs.map((s) => (
                      <tr key={s.swab_id}>
                        <td className={tableStyles.td}>
                          <p className="font-medium text-slate-900">{s.patient_name ?? `Patient ${s.patient_id}`}</p>
                          <p className="text-xs text-slate-500">ID {s.patient_id}</p>
                        </td>
                        <td className={tableStyles.td}>{s.swab_type.replace("_", "/")}</td>
                        <td className={`${tableStyles.td} whitespace-nowrap`}>{formatDateTime(s.swab_date)}</td>
                        <td className={tableStyles.td}>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              s.result === "positive"
                                ? "text-rose-700"
                                : s.result === "negative"
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {s.result === "positive" ? (
                              <icons.alert className="h-3.5 w-3.5" />
                            ) : s.result === "negative" ? (
                              <icons.check className="h-3.5 w-3.5" />
                            ) : (
                              <icons.clock className="h-3.5 w-3.5" />
                            )}
                            {s.result ? s.result[0].toUpperCase() + s.result.slice(1) : "—"}
                          </span>
                        </td>
                        <td className={tableStyles.td}>{s.swab_location ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
          </div>
        )}
      </Card>
    </>
  );
}
