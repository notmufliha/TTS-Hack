import { listHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export const GET = listHandler(
  "referralOrders",
  `SELECT ro.*, p.patient_name, p.nric, p.age, p.gender
   FROM referral_order ro
   LEFT JOIN patient p ON ro.patient_id = p.patient_id
   ORDER BY ro.order_datetime DESC`
);
