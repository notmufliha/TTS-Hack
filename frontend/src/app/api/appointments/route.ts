import { listHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export const GET = listHandler(
  "appointments",
  `SELECT a.*, p.patient_name
   FROM appointment a
   LEFT JOIN patient p ON a.patient_id = p.patient_id
   ORDER BY a.appointment_date DESC`
);
