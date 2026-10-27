import type { PoolClient } from "pg";
import { HttpError } from "./api-route";
import { assessReferral } from "./screening";
import type { Appointment, PatientMedicalHistory, ReferralOrder, Swab } from "./types";

// Reads only what the readiness checklist needs for one referral and assesses it.
export async function assessOrder(client: PoolClient, order: ReferralOrder) {
  const historyResult = await client.query<PatientMedicalHistory>(
    `SELECT * FROM patient_medical_history
     WHERE patient_id = $1
     ORDER BY last_updated DESC
     LIMIT 1`,
    [order.patient_id]
  );
  const history = historyResult.rows[0];
  if (!history) {
    throw new HttpError(422, `No medical history found for patient ${order.patient_id}`);
  }

  const appointmentsResult = await client.query<Appointment>(
    `SELECT appointment_id, patient_id, appointment_date, appointment_type, status
     FROM appointment
     WHERE patient_id = $1
       AND appointment_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
       AND COALESCE(LOWER(status), 'scheduled') NOT IN ('cancelled', 'completed', 'no-show')
     ORDER BY appointment_date`,
    [order.patient_id]
  );

  const swabsResult = await client.query<Swab>(
    `SELECT swab_id, patient_id, swab_type, swab_date, result
     FROM swab WHERE patient_id = $1 ORDER BY swab_date DESC`,
    [order.patient_id]
  );

  const assessment = assessReferral({
    history,
    upcomingAppointments: appointmentsResult.rows,
    swabs: swabsResult.rows,
    provider: order.provider,
  });

  return { history, assessment };
}

export async function patientSummary(client: PoolClient, patientId: number) {
  const result = await client.query(
    `SELECT patient_name, nric, age, gender FROM patient WHERE patient_id = $1`,
    [patientId]
  );
  return result.rows[0] ?? {};
}
