// Readiness screening for ICH transfer, applied straight to database records.
// Each rule comes from the ICH PSO readiness checklist. The rules are
// deterministic, so the same referral always gets the same result and every
// result can be traced back to a criterion.
import type {
  Appointment,
  Assessment,
  Criterion,
  CriterionStatus,
  PatientMedicalHistory,
  Swab,
  SwabCheck,
} from "./types";

const EXCLUSIONS: { key: keyof PatientMedicalHistory; label: string }[] = [
  { key: "iv_chemo_radiotherapy", label: "IV chemotherapy / radiotherapy" },
  { key: "dialysis", label: "Dialysis" },
  { key: "parenteral_nutrition", label: "Parenteral nutrition" },
  { key: "psychiatric_issues", label: "Psychiatric or behavioural issues" },
  { key: "suicidal_precaution", label: "Suicidal precaution" },
  { key: "bipap_cpap", label: "BIPAP / CPAP" },
];

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  // Date-only values are Singapore calendar days.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+08:00` : value;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Patients may transfer only if tracheostomy suctioning is needed less often
// than every 4 hours (interval > 4h). "less_than_4hr" / "<=4hr" mean MORE frequent.
export function tracheostomyStatus(freq: string | null): CriterionStatus {
  if (freq === null || freq === undefined) return "PASS";
  const f = String(freq).trim().toLowerCase();
  if (f === "" || f === "nil" || f === "none" || f === "null" || f === "no") return "PASS";
  if (f === "more_than_4hr" || f === ">4hr" || f.startsWith(">")) return "PASS";
  if (f === "less_than_4hr" || f === "<=4hr" || f.startsWith("<")) return "FAIL";
  const hourly = f.match(/(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours|hourly)/);
  if (hourly) return Number(hourly[1]) > 4 ? "PASS" : "FAIL";
  return "REVIEW";
}

function rangeCriterion(
  key: string,
  label: string,
  raw: unknown,
  expected: string,
  ok: (n: number) => boolean,
  unit = ""
): Criterion {
  const n = toNumber(raw);
  if (n === null) {
    return { key, label, expected, actual: "Not recorded", status: "REVIEW" };
  }
  return { key, label, expected, actual: `${n}${unit}`, status: ok(n) ? "PASS" : "FAIL" };
}

export function assessVitals(history: PatientMedicalHistory): Criterion[] {
  const vitals = [
    rangeCriterion("temperature", "Temperature", history.temperature, "< 37.5 °C", (n) => n < 37.5, " °C"),
    rangeCriterion("systolic_bp", "Systolic BP", history.systolic_bp, "100–170 mmHg", (n) => n >= 100 && n <= 170, " mmHg"),
    rangeCriterion("pulse", "Pulse", history.pulse, "50–100 /min", (n) => n >= 50 && n <= 100, " /min"),
    rangeCriterion("respiratory_rate", "Respiratory rate", history.respiratory_rate, "12–20 /min", (n) => n >= 12 && n <= 20, " /min"),
    rangeCriterion("spo2", "SpO2", history.spo2, "≥ 95%", (n) => n >= 95, "%"),
    rangeCriterion("oxygen_level", "Oxygen", history.oxygen_level, "≤ 2 L/min", (n) => n <= 2, " L/min"),
  ];

  // Low SpO2 can be acceptable in special circumstances (e.g. Type II
  // respiratory failure). A clinician decides, so it goes to review.
  const spo2 = vitals.find((v) => v.key === "spo2")!;
  if (spo2.status === "FAIL" && history.special_circumstance?.trim()) {
    spo2.status = "REVIEW";
    spo2.actual += ` (special circumstance: ${history.special_circumstance.trim()})`;
  }
  return vitals;
}

export function assessExclusions(history: PatientMedicalHistory): Criterion[] {
  const criteria: Criterion[] = EXCLUSIONS.map(({ key, label }) => {
    const present = history[key] === true;
    return {
      key: String(key),
      label,
      expected: "NIL",
      actual: present ? "Present" : "NIL",
      status: present ? "FAIL" : "PASS",
    };
  });
  criteria.push({
    key: "tracheostomy_freq",
    label: "Tracheostomy suctioning",
    expected: "NIL or less often than 4-hourly",
    actual: history.tracheostomy_freq ? String(history.tracheostomy_freq).replace(/_/g, " ") : "NIL",
    status: tracheostomyStatus(history.tracheostomy_freq),
  });
  return criteria;
}

export function classifyImaging(type: string) {
  const t = type.toLowerCase();
  if (t.includes("doppler")) return "ultrasound_doppler" as const;
  if (t.includes("ultrasound") || /\busg\b/.test(t)) return "ultrasound_scans" as const;
  if (t.includes("x-ray") || t.includes("xray") || t.includes("x ray") || /\baims\b/.test(t)) {
    return "xrays_and_aims_modalities" as const;
  }
  return null;
}

// `upcoming` should already be limited to scheduled appointments in the next 3 days.
export function assessImaging(upcoming: Appointment[]): Assessment["imaging"] {
  const imaging: Assessment["imaging"] = {
    xrays_and_aims_modalities: false,
    ultrasound_doppler: false,
    ultrasound_scans: false,
    appointments: [],
  };
  for (const appt of upcoming) {
    const modality = classifyImaging(appt.appointment_type || "");
    if (modality) {
      imaging[modality] = true;
      imaging.appointments.push(appt);
    }
  }
  return imaging;
}

const SWAB_TYPES: { type: SwabCheck["type"]; match: (t: string) => boolean }[] = [
  { type: "CRE/CPO", match: (t) => t.includes("cre") || t.includes("cpo") },
  { type: "MRSA", match: (t) => t.includes("mrsa") },
  { type: "VRE", match: (t) => t.includes("vre") },
];

export function assessSwabs(
  swabs: Swab[],
  provider: string | null,
  now: Date = new Date()
): Assessment["swabs"] {
  const p = (provider || "").toLowerCase();
  const internal = p.includes("ttsh") || p.includes("ncid");
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;

  let allRecentNegative = true;
  const checks: SwabCheck[] = SWAB_TYPES.map(({ type, match }) => {
    if (type === "VRE" && internal) {
      return {
        type,
        status: "not_required",
        recommendation: "Not required for internal TTSH/NCID patients",
      };
    }

    const latest = swabs
      .filter((s) => match((s.swab_type || "").toLowerCase()))
      .map((s) => ({ ...s, when: toDate(s.swab_date) }))
      .filter((s) => s.when)
      .sort((a, b) => b.when!.getTime() - a.when!.getTime())[0];

    const result = latest?.result?.toLowerCase();
    if (!latest || result !== "negative" || latest.when!.getTime() < dayAgo || latest.when!.getTime() > now.getTime()) {
      allRecentNegative = false;
    }

    if (result === "positive") {
      return { type, status: "positive", recommendation: "Plan admission and inform BMU for an isolation bed" };
    }
    if (result === "negative") {
      return { type, status: "negative", recommendation: "No action needed" };
    }
    return { type, status: "unknown", recommendation: "Request swab on transfer day" };
  });

  return {
    all_negative_within_24h: allRecentNegative,
    requires_isolation: checks.some((c) => c.status === "positive"),
    checks,
  };
}

export function assessReferral(input: {
  history: PatientMedicalHistory;
  upcomingAppointments: Appointment[];
  swabs: Swab[];
  provider: string | null;
  now?: Date;
}): Assessment {
  const exclusions = assessExclusions(input.history);
  const vitals = assessVitals(input.history);
  const imaging = assessImaging(input.upcomingAppointments);
  const swabs = assessSwabs(input.swabs, input.provider, input.now);

  const failedExclusions = exclusions.filter((c) => c.status === "FAIL");
  const needsReview = [...exclusions, ...vitals].filter((c) => c.status !== "PASS");

  let decision: Assessment["decision"];
  let reasons: string[];

  if (failedExclusions.length > 0) {
    // Hard exclusion criteria: the patient is not suitable for ICH.
    decision = "Rejected";
    reasons = failedExclusions.map((c) => `${c.label}: ${c.actual}`);
  } else if (needsReview.length > 0 || imaging.appointments.length > 0) {
    // Vitals out of range, missing data, or imaging coming up: a screening
    // clinician must decide.
    decision = "Escalated";
    reasons = needsReview.map((c) =>
      c.status === "REVIEW"
        ? `${c.label} needs review: ${c.actual}`
        : `${c.label} out of range: ${c.actual} (expected ${c.expected})`
    );
    for (const appt of imaging.appointments) {
      reasons.push(`Imaging within 3 days: ${appt.appointment_type}`);
    }
  } else {
    decision = "Accepted";
    reasons = ["All readiness criteria met"];
  }

  if (swabs.requires_isolation) {
    reasons.push("Positive swab: isolation bed required");
  }

  return { decision, reasons, exclusions, vitals, imaging, swabs };
}
