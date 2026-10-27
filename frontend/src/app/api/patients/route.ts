import { listHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export const GET = listHandler(
  "patients",
  `SELECT patient_id, patient_name, nric, age, gender, created_at
   FROM patient
   ORDER BY created_at DESC`
);
