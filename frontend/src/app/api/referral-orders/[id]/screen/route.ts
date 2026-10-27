import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/api-route";
import { assessOrder, patientSummary } from "@/lib/screening-data";
import type { ReferralOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

const NOW_SG = "DATE_TRUNC('second', TIMEZONE('Asia/Singapore', CURRENT_TIMESTAMP))";

// Previews the checklist for a referral without saving anything. Used by the
// screening clinician to review an escalated case.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const client = await pool.connect();
  try {
    if (!Number.isInteger(orderId)) throw new HttpError(400, "Invalid order ID");
    const orderResult = await client.query<ReferralOrder>(`SELECT * FROM referral_order WHERE order_id = $1`, [orderId]);
    const order = orderResult.rows[0];
    if (!order) throw new HttpError(404, "Referral order not found");

    const { history, assessment } = await assessOrder(client, order);
    const patient = await patientSummary(client, order.patient_id);
    return NextResponse.json({
      success: true,
      order: { ...order, ...patient },
      history_id: history.history_id,
      readiness_id: null,
      assessment,
    });
  } catch (error) {
    return errorResponse(error);
  } finally {
    client.release();
  }
}

// Screens a pending referral in a single transaction: it reads the latest medical
// history, imaging appointments in the next 3 days and swabs, applies the
// readiness checklist, records the checklist, and updates the referral order.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const body = await request.json().catch(() => ({}));
  const psaName = typeof body.psa_name === "string" && body.psa_name.trim() ? body.psa_name.trim() : "PSA";

  const client = await pool.connect();
  try {
    if (!Number.isInteger(orderId)) throw new HttpError(400, "Invalid order ID");

    await client.query("BEGIN");

    const orderResult = await client.query<ReferralOrder>(
      `SELECT * FROM referral_order WHERE order_id = $1 FOR UPDATE`,
      [orderId]
    );
    const order = orderResult.rows[0];
    if (!order) throw new HttpError(404, "Referral order not found");
    if (order.referral_status !== "Pending" || order.case_escalated_to_clinician) {
      throw new HttpError(409, `Referral order already processed (${order.referral_status})`);
    }

    const { history, assessment } = await assessOrder(client, order);

    const escalated = assessment.decision === "Escalated";
    const status = escalated ? "Pending" : assessment.decision;
    // readiness_screening_checklist.screening_result allows 'Ready' | 'Not Ready' | 'Pending'.
    const screeningResult = escalated ? "Pending" : assessment.decision === "Accepted" ? "Ready" : "Not Ready";
    const notes = assessment.reasons.join("; ");

    const checklistResult = await client.query<{ readiness_id: number }>(
      `INSERT INTO readiness_screening_checklist
         (patient_id, history_id, screening_datetime, screening_result, notes)
       VALUES ($1, $2, ${NOW_SG}, $3, $4)
       RETURNING readiness_id`,
      [order.patient_id, history.history_id, screeningResult, escalated ? `Escalated to clinician: ${notes}` : notes]
    );

    const has = (key: string) => assessment.exclusions.find((c) => c.key === key)?.status === "FAIL";
    const ok = (key: string) => assessment.vitals.find((c) => c.key === key)?.status === "PASS";

    // Condition columns are true when the patient HAS the condition; vitals
    // columns are true when the vital is within range; imaging columns are
    // true when an appointment of that modality is due within 3 days.
    const updated = await client.query<ReferralOrder>(
      `UPDATE referral_order SET
         iv_chemo_radiotherapy = $1,
         dialysis = $2,
         parenteral_nutrition = $3,
         psychiatric_issues = $4,
         suicidal_precaution = $5,
         bipap_cpap = $6,
         tracheostomy = $7,
         temperature = $8,
         systolic_bp = $9,
         pulse = $10,
         respiratory_rate = $11,
         spo2 = $12,
         oxygen_level = $13,
         xray_aims_modalities = $14,
         ultrasound_doppler = $15,
         ultrasound_scans = $16,
         referral_status = $17::text,
         case_escalated_to_clinician = $18,
         rejected_reason = $19,
         psa_name = $20,
         reviewed_datetime = ${NOW_SG},
         accepted_withdrawn_datetime = CASE WHEN $17::text IN ('Accepted', 'Rejected') THEN ${NOW_SG} ELSE NULL END
       WHERE order_id = $21
       RETURNING *`,
      [
        has("iv_chemo_radiotherapy"),
        has("dialysis"),
        has("parenteral_nutrition"),
        has("psychiatric_issues"),
        has("suicidal_precaution"),
        has("bipap_cpap"),
        assessment.exclusions.find((c) => c.key === "tracheostomy_freq")?.status === "PASS",
        ok("temperature"),
        ok("systolic_bp"),
        ok("pulse"),
        ok("respiratory_rate"),
        ok("spo2"),
        ok("oxygen_level"),
        assessment.imaging.xrays_and_aims_modalities,
        assessment.imaging.ultrasound_doppler,
        assessment.imaging.ultrasound_scans,
        status,
        escalated,
        assessment.decision === "Rejected" ? notes : null,
        psaName,
        orderId,
      ]
    );

    await client.query("COMMIT");

    const patient = await patientSummary(client, order.patient_id);

    return NextResponse.json({
      success: true,
      order: { ...updated.rows[0], ...patient },
      history_id: history.history_id,
      readiness_id: checklistResult.rows[0]?.readiness_id ?? null,
      assessment,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return errorResponse(error);
  } finally {
    client.release();
  }
}
