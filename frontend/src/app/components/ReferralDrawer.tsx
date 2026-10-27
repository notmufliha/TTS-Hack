"use client";

import { useEffect, useState } from "react";
import { downloadChecklistPdf } from "@/lib/checklist-pdf";
import { formatDateTime, formatMinutes, maskNric, referralOutcome } from "@/lib/format";
import type { ReferralOrder, ScreeningResponse } from "@/lib/types";
import { referralOrdersAPI } from "./api";
import { AssessmentView } from "./AssessmentView";
import { buttonStyles, Chip, ErrorBanner, icons, OutcomeBadge, Spinner } from "./ui";

const PSA_NAME = "PSA";

export function referralFlags(order: ReferralOrder) {
  const flags: string[] = [];
  if (order.iv_chemo_radiotherapy) flags.push("IV chemo / RT");
  if (order.dialysis) flags.push("Dialysis");
  if (order.parenteral_nutrition) flags.push("Parenteral nutrition");
  if (order.psychiatric_issues) flags.push("Psych / behavioural");
  if (order.bipap_cpap) flags.push("BiPAP / CPAP");
  if (Number(order.oxygen_requirement) >= 2) flags.push(`O₂ ${order.oxygen_requirement} L/min`);
  return flags;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{children || "—"}</dd>
    </div>
  );
}

function ReferralDetails({ order }: { order: ReferralOrder }) {
  const flags = referralFlags(order);
  return (
    <section className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Detail label="Referred">{formatDateTime(order.order_datetime)}</Detail>
        <Detail label="Source">{order.provider}</Detail>
        <Detail label="Ward type">{order.ward_type}</Detail>
        <Detail label="Isolation / infection">{order.isolation_infection_status}</Detail>
        <Detail label="PT/OT recommended">{order.referral_recommended_pt_ot ? "Yes" : "No"}</Detail>
        <Detail label="Discharge planning">{order.discharge_planning ? "Established" : "Not yet"}</Detail>
      </dl>
      {flags.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-slate-500">Flagged on referral form</p>
          <div className="flex flex-wrap gap-1">
            {flags.map((f) => (
              <Chip key={f} tone="rose">
                {f}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {(order.special_precautions || order.comments) && (
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {order.comments && <p>{order.comments}</p>}
          {order.special_precautions && <p className="text-slate-500">Precautions: {order.special_precautions}</p>}
        </div>
      )}
    </section>
  );
}

function OutcomeSummary({ order }: { order: ReferralOrder }) {
  const tat =
    order.accepted_withdrawn_datetime && order.order_datetime
      ? (new Date(order.accepted_withdrawn_datetime).getTime() - new Date(order.order_datetime).getTime()) / 60000
      : null;
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Outcome</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Detail label="Status">
          <OutcomeBadge outcome={referralOutcome(order)} />
        </Detail>
        <Detail label="Referral → decision">{formatMinutes(tat)}</Detail>
        <Detail label="Screened">{formatDateTime(order.reviewed_datetime)}</Detail>
        <Detail label="Decided">{formatDateTime(order.accepted_withdrawn_datetime)}</Detail>
        <Detail label="Screened by">{order.psa_name}</Detail>
        <Detail label="Clinician involved">{order.case_escalated_to_clinician ? "Yes" : "No"}</Detail>
      </dl>
      {order.rejected_reason && (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{order.rejected_reason}</p>
      )}
    </section>
  );
}

export function ReferralDrawer({
  order,
  autoScreen,
  onClose,
  onChanged,
}: {
  order: ReferralOrder;
  autoScreen: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const outcome = referralOutcome(order);
  const [result, setResult] = useState<ScreeningResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [decided, setDecided] = useState<string | null>(null);

  const runScreening = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await referralOrdersAPI.screen(order.order_id, PSA_NAME);
      setResult(response);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (decision: "Accepted" | "Rejected") => {
    setBusy(true);
    setError(null);
    try {
      await referralOrdersAPI.decide(order.order_id, decision, decision === "Rejected" ? reason.trim() : undefined);
      setDecided(decision);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (outcome === "To screen" && autoScreen) {
      runScreening();
    } else if (outcome === "Escalated") {
      setBusy(true);
      referralOrdersAPI
        .preview(order.order_id)
        .then(setResult)
        .catch((err) => setError(err instanceof Error ? err.message : "Could not load checklist"))
        .finally(() => setBusy(false));
    }
    // Run once per opened referral.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.order_id]);

  const escalatedAfterScreening = result?.assessment.decision === "Escalated";
  const showDecisionForm = !decided && (outcome === "Escalated" || (outcome === "To screen" && escalatedAfterScreening));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button aria-label="Close" className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {order.referral_id} · Order #{order.order_id}
            </p>
            <h2 id="drawer-title" className="truncate text-lg font-semibold text-slate-900">
              {order.patient_name ?? `Patient ${order.patient_id}`}
            </h2>
            <p className="text-sm text-slate-500">
              {[order.age && `${order.age} yrs`, order.gender, maskNric(order.nric)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close panel">
            <icons.x className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {error && <ErrorBanner message={error} />}

          {decided && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900">
              <icons.check className="h-5 w-5 text-emerald-700" />
              Clinician decision recorded: {decided}
            </div>
          )}

          {busy && !result && <Spinner label={outcome === "To screen" ? "Screening referral…" : "Loading checklist…"} />}

          {result && <AssessmentView assessment={result.assessment} />}

          {outcome === "To screen" && !result && !busy && (
            <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm text-slate-600">
                Screening checks this referral against the ICH readiness checklist using the patient&apos;s latest
                records, then records the outcome.
              </p>
              <button onClick={runScreening} className={`${buttonStyles.primary} mt-3`}>
                Run readiness screening
              </button>
            </div>
          )}

          {(outcome === "Accepted" || outcome === "Rejected" || outcome === "Withdrawn" || outcome === "Cancelled") && (
            <OutcomeSummary order={order} />
          )}

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Referral</h3>
            <ReferralDetails order={order} />
          </section>
        </div>

        {(result || showDecisionForm) && (
          <footer className="space-y-3 border-t border-slate-200 bg-white px-6 py-4">
            {showDecisionForm && result && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Screening clinician decision</p>
                {rejecting ? (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-500">Reason for rejection (sent to the referring clinician)</span>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        autoFocus
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide("Rejected")}
                        disabled={busy || !reason.trim()}
                        className={buttonStyles.danger}
                      >
                        Confirm rejection
                      </button>
                      <button onClick={() => setRejecting(false)} className={buttonStyles.secondary}>
                        Back
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => decide("Accepted")} disabled={busy} className={buttonStyles.success}>
                      <icons.check className="h-4 w-4" /> Accept
                    </button>
                    <button onClick={() => setRejecting(true)} disabled={busy} className={buttonStyles.secondary}>
                      <icons.x className="h-4 w-4" /> Reject…
                    </button>
                  </div>
                )}
              </div>
            )}
            {result && (
              <button onClick={() => downloadChecklistPdf(result)} className={buttonStyles.secondary}>
                <icons.download className="h-4 w-4" /> Download checklist PDF
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
