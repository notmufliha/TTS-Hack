import { useState, useEffect } from "react";
import {
  patientsAPI,
  appointmentsAPI,
  medicalHistoryAPI,
  swabsAPI,
  referralOrdersAPI,
} from "./api";

export function useApiData() {
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    medicalHistories: [],
    swabs: [],
    referralOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [patientsRes, appointmentsRes, medicalRes, swabsRes,referralOrdersRes] =
        await Promise.all([
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
        referralOrders: referralOrdersRes.referralOrders || referralOrdersRes.data || [],
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refetch = () => {
    fetchAllData();
  };

  return { data, loading, error, refetch };
}
