import type { ReferralOrder } from "./types";

export type Outcome = "To screen" | "Escalated" | "Accepted" | "Rejected" | "Withdrawn" | "Cancelled";

export function referralOutcome(
  order: Pick<ReferralOrder, "referral_status" | "case_escalated_to_clinician">
): Outcome {
  if (order.referral_status === "Pending") {
    return order.case_escalated_to_clinician ? "Escalated" : "To screen";
  }
  if (order.referral_status === "Started") return "To screen";
  return order.referral_status;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatRelative(value: string | null | undefined, now: Date = new Date()) {
  if (!value) return "—";
  const minutes = Math.round((now.getTime() - new Date(value).getTime()) / 60000);
  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 60 / 24)} d ago`;
}

export function formatMinutes(minutes: number | null) {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 60 * 24) return `${(minutes / 60).toFixed(1)} h`;
  return `${(minutes / 60 / 24).toFixed(1)} d`;
}

export function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

// Show only the first letter and last four characters of an NRIC: S****567A.
export function maskNric(nric: string | null | undefined) {
  if (!nric) return "—";
  return nric.length > 5 ? `${nric[0]}****${nric.slice(-4)}` : nric;
}
