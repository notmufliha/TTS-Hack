import { useCallback, useEffect, useState } from "react";
import type { Appointment, Patient, PatientMedicalHistory, ReferralOrder, Swab } from "@/lib/types";
import { appointmentsAPI, medicalHistoryAPI, patientsAPI, referralOrdersAPI, swabsAPI } from "./api";

export interface ApiData {
  patients: Patient[];
  appointments: Appointment[];
  medicalHistories: PatientMedicalHistory[];
  swabs: Swab[];
  referralOrders: ReferralOrder[];
}

export function useApiData() {
  const [data, setData] = useState<ApiData>({
    patients: [],
    appointments: [],
    medicalHistories: [],
    swabs: [],
    referralOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [patientsRes, appointmentsRes, medicalRes, swabsRes, referralOrdersRes] = await Promise.all([
        patientsAPI.getAll(),
        appointmentsAPI.getAll(),
        medicalHistoryAPI.getAll(),
        swabsAPI.getAll(),
        referralOrdersAPI.getAll(),
      ]);

      setData({
        patients: patientsRes.patients || [],
        appointments: appointmentsRes.appointments || [],
        medicalHistories: medicalRes.medicalHistories || [],
        swabs: swabsRes.swabs || [],
        referralOrders: referralOrdersRes.referralOrders || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
}
