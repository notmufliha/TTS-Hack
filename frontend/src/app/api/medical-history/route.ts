import { listHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export const GET = listHandler(
  "medicalHistories",
  `SELECT mh.*, p.patient_name, p.age, p.gender
   FROM patient_medical_history mh
   LEFT JOIN patient p ON mh.patient_id = p.patient_id
   ORDER BY mh.last_updated DESC`
);
