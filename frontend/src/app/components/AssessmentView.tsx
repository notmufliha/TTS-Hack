import type { Assessment, Criterion, SwabCheck } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { CriterionMark, icons } from "./ui";

const DECISION_STYLES: Record<Assessment["decision"], { className: string; icon: keyof typeof icons; title: string }> = {
  Accepted: { className: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: "check", title: "Accepted" },
  Rejected: { className: "border-rose-200 bg-rose-50 text-rose-900", icon: "x", title: "Rejected" },
  Escalated: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "alert",
    title: "Escalated to screening clinician",
  },
};

export function DecisionBanner({ assessment }: { assessment: Assessment }) {
  const style = DECISION_STYLES[assessment.decision];
  const BannerIcon = icons[style.icon];
  return (
    <div className={`rounded-lg border p-4 ${style.className}`}>
      <p className="flex items-center gap-2 font-semibold">
        <BannerIcon className="h-5 w-5" />
        {style.title}
      </p>
      <ul className="mt-2 space-y-1 pl-7 text-sm">
        {assessment.reasons.map((reason) => (
          <li key={reason} className="list-disc">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CriteriaList({ title, rows }: { title: string; rows: Criterion[] }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {rows.map((c) => (
          <li key={c.key} className="flex items-start justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{c.label}</p>
              <p className="text-xs text-slate-500">
                {c.actual} <span className="text-slate-400">· expected {c.expected}</span>
              </p>
            </div>
            <CriterionMark status={c.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const SWAB_LABELS: Record<SwabCheck["status"], { text: string; className: string }> = {
  negative: { text: "Negative", className: "text-emerald-700" },
  positive: { text: "Positive", className: "text-rose-700" },
  unknown: { text: "Unknown", className: "text-amber-700" },
  not_required: { text: "Not required", className: "text-slate-500" },
};

export function AssessmentView({ assessment }: { assessment: Assessment }) {
  const imaging: [string, boolean][] = [
    ["X-rays & AIMS modalities", assessment.imaging.xrays_and_aims_modalities],
    ["Ultrasound Doppler", assessment.imaging.ultrasound_doppler],
    ["Ultrasound scans", assessment.imaging.ultrasound_scans],
  ];

  return (
    <div className="space-y-6">
      <DecisionBanner assessment={assessment} />
      <CriteriaList title="Exclusion criteria" rows={assessment.exclusions} />
      <CriteriaList title="Vitals" rows={assessment.vitals} />

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Imaging in the next 3 days</h3>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {imaging.map(([label, scheduled]) => (
            <li key={label} className="flex items-center justify-between px-3 py-2.5 text-sm">
              <span className="font-medium text-slate-900">{label}</span>
              <span className={scheduled ? "font-medium text-amber-700" : "text-slate-500"}>
                {scheduled ? "Scheduled" : "None"}
              </span>
            </li>
          ))}
          {assessment.imaging.appointments.map((appt) => (
            <li key={appt.appointment_id} className="px-3 py-2 text-xs text-slate-600">
              {appt.appointment_type} · {formatDateTime(appt.appointment_date)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Swab surveillance</h3>
        {assessment.swabs.all_negative_within_24h && (
          <p className="mb-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            All required swabs negative within 24 hours: transfer directly to ICH.
          </p>
        )}
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {assessment.swabs.checks.map((check) => (
            <li key={check.type} className="px-3 py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">{check.type}</span>
                <span className={`font-medium ${SWAB_LABELS[check.status].className}`}>
                  {SWAB_LABELS[check.status].text}
                </span>
              </div>
              <p className="text-xs text-slate-500">{check.recommendation}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
