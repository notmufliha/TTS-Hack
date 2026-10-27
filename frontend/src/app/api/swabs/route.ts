import { listHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export const GET = listHandler(
  "swabs",
  `SELECT s.*, p.patient_name
   FROM swab s
   LEFT JOIN patient p ON s.patient_id = p.patient_id
   ORDER BY s.swab_date DESC`
);
