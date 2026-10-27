export type ReferralStatus =
  | "Pending"
  | "Started"
  | "Accepted"
  | "Rejected"
  | "Withdrawn"
  | "Cancelled";

export interface Patient {
  patient_id: number;
  patient_name: string;
  nric: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  created_at: string;
}

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  appointment_date: string;
  appointment_type: string;
  created_at: string;
  status: string;
  notes: string | null;
  patient_name?: string;
}

export interface PatientMedicalHistory {
  history_id: number;
  patient_id: number;
  iv_chemo_radiotherapy: boolean;
  dialysis: boolean;
  parenteral_nutrition: boolean;
  psychiatric_issues: boolean;
  suicidal_precaution: boolean;
  bipap_cpap: boolean;
  tracheostomy_freq: string | null;
  temperature: number | string | null;
  systolic_bp: number | string | null;
  diastolic_bp: number | string | null;
  pulse: number | string | null;
  respiratory_rate: number | string | null;
  spo2: number | string | null;
  oxygen_level: number | string | null;
  special_circumstance: string | null;
  last_updated: string;
  patient_name?: string;
  age?: number;
  gender?: string;
}

export interface Swab {
  swab_id: number;
  patient_id: number;
  swab_type: string;
  swab_date: string | null;
  result: string | null;
  result_date: string | null;
  swab_location: string | null;
  notes: string | null;
  created_at: string;
  patient_name?: string;
}

export interface ReferralOrder {
  order_id: number;
  referral_id: number;
  patient_id: number;
  order_datetime: string;
  comments: string | null;
  provider: string | null;
  community_hospital: string | null;
  ward_type: string | null;
  psychiatric_issues: boolean;
  iv_chemo_radiotherapy: boolean;
  parenteral_nutrition: boolean;
  bipap_cpap: boolean;
  tracheostomy_freq: string | null;
  oxygen_requirement: number | string | null;
  dialysis: boolean;
  referral_recommended_pt_ot: boolean;
  discharge_planning: boolean;
  special_precautions: string | null;
  isolation_infection_status: string | null;
  reviewed_datetime: string | null;
  accepted_withdrawn_datetime: string | null;
  referral_status: ReferralStatus;
  case_escalated_to_clinician: boolean;
  rejected_reason: string | null;
  additional_comments: string | null;
  psa_name: string | null;
  patient_name?: string;
  nric?: string;
  age?: number;
  gender?: string;
}

export type CriterionStatus = "PASS" | "FAIL" | "REVIEW";

export interface Criterion {
  key: string;
  label: string;
  expected: string;
  actual: string;
  status: CriterionStatus;
}

export interface SwabCheck {
  type: "CRE/CPO" | "MRSA" | "VRE";
  status: "negative" | "positive" | "unknown" | "not_required";
  recommendation: string;
}

export interface Assessment {
  decision: "Accepted" | "Rejected" | "Escalated";
  reasons: string[];
  exclusions: Criterion[];
  vitals: Criterion[];
  imaging: {
    xrays_and_aims_modalities: boolean;
    ultrasound_doppler: boolean;
    ultrasound_scans: boolean;
    appointments: Appointment[];
  };
  swabs: {
    all_negative_within_24h: boolean;
    requires_isolation: boolean;
    checks: SwabCheck[];
  };
}

export interface ScreeningResponse {
  order: ReferralOrder;
  history_id: number;
  readiness_id: number | null;
  assessment: Assessment;
}

export interface MonthlyReport {
  month: string;
  totals: {
    referrals: number;
    accepted: number;
    rejected: number;
    escalated: number;
    pending: number;
    withdrawn_or_cancelled: number;
  };
  tat_minutes: {
    order_to_review_avg: number | null;
    order_to_decision_avg: number | null;
    order_to_decision_median: number | null;
  };
  time_saved_minutes: number;
  rejection_reasons: { reason: string; count: number }[];
  rows: (ReferralOrder & { tat_minutes: number | null })[];
}
