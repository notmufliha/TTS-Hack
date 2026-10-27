import type {
  Appointment,
  MonthlyReport,
  Patient,
  PatientMedicalHistory,
  ReferralOrder,
  ScreeningResponse,
  Swab,
} from "@/lib/types";

// Same-origin API (Next.js route handlers under /api).
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `HTTP error! status: ${response.status}`);
  }
  return data as T;
}

export const patientsAPI = {
  getAll: () => fetchAPI<{ patients: Patient[] }>("/patients"),
};

export const appointmentsAPI = {
  getAll: () => fetchAPI<{ appointments: Appointment[] }>("/appointments"),
};

export const medicalHistoryAPI = {
  getAll: () => fetchAPI<{ medicalHistories: PatientMedicalHistory[] }>("/medical-history"),
};

export const swabsAPI = {
  getAll: () => fetchAPI<{ swabs: Swab[] }>("/swabs"),
};

export const referralOrdersAPI = {
  getAll: () => fetchAPI<{ referralOrders: ReferralOrder[] }>("/referral-orders"),
  preview: (orderId: number) => fetchAPI<ScreeningResponse>(`/referral-orders/${orderId}/screen`),
  screen: (orderId: number, psaName: string) =>
    fetchAPI<ScreeningResponse>(`/referral-orders/${orderId}/screen`, {
      method: "POST",
      body: JSON.stringify({ psa_name: psaName }),
    }),
  decide: (orderId: number, decision: "Accepted" | "Rejected", reason?: string) =>
    fetchAPI<{ order: ReferralOrder }>(`/referral-orders/${orderId}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision, reason }),
    }),
};

export const reportsAPI = {
  monthly: (month?: string) =>
    fetchAPI<{ report: MonthlyReport }>(`/reports/monthly${month ? `?month=${month}` : ""}`),
};
