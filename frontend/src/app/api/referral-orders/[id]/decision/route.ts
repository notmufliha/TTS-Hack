import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/api-route";

export const dynamic = "force-dynamic";

const NOW_SG = "DATE_TRUNC('second', TIMEZONE('Asia/Singapore', CURRENT_TIMESTAMP))";

// A screening clinician's decision on a referral that automated screening escalated.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const body = await request.json().catch(() => ({}));
  const decision = body.decision;
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  const client = await pool.connect();
  try {
    if (!Number.isInteger(orderId)) throw new HttpError(400, "Invalid order ID");
    if (decision !== "Accepted" && decision !== "Rejected") {
      throw new HttpError(400, "decision must be 'Accepted' or 'Rejected'");
    }
    if (decision === "Rejected" && !reason) {
      throw new HttpError(400, "A reason is required to reject a referral");
    }

    await client.query("BEGIN");

    const updated = await client.query(
      `UPDATE referral_order SET
         referral_status = $1,
         rejected_reason = $2,
         accepted_withdrawn_datetime = ${NOW_SG}
       WHERE order_id = $3
         AND referral_status = 'Pending'
         AND case_escalated_to_clinician = true
       RETURNING *`,
      [decision, decision === "Rejected" ? reason : null, orderId]
    );
    if (updated.rowCount === 0) {
      throw new HttpError(409, "Referral order is not awaiting a clinician decision");
    }

    const order = updated.rows[0];
    await client.query(
      `UPDATE readiness_screening_checklist
       SET screening_result = $1,
           notes = CONCAT(notes, $2::text)
       WHERE readiness_id = (
         SELECT MAX(readiness_id) FROM readiness_screening_checklist WHERE patient_id = $3
       )`,
      [decision === "Accepted" ? "Ready" : "Not Ready", ` | Clinician decision: ${decision}${reason ? ` (${reason})` : ""}`, order.patient_id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true, order });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return errorResponse(error);
  } finally {
    client.release();
  }
}
