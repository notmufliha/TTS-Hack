const pool = require("../config/database");

class ReferralOrder {
  static async findAll() {
    const result = await pool.query(`
      SELECT ro.*, p.patient_name, p.nric, p.age, p.gender
      FROM referral_order ro
      LEFT JOIN patient p ON ro.patient_id = p.patient_id
      ORDER BY ro.order_datetime DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `
      SELECT ro.*, p.patient_name, p.nric, p.age, p.gender
      FROM referral_order ro
      LEFT JOIN patient p ON ro.patient_id = p.patient_id
      WHERE ro.order_id = $1
    `,
      [id]
    );
    return result.rows[0];
  }

  static async create(referralOrderData) {
    const {
      referral_id,
      patient_id,
      order_datetime,
      comments,
      provider,
      community_hospital,
      ward_type,
      psychiatric_issues,
      iv_chemo_radiotherapy,
      parenteral_nutrition,
      bipap_cpap,
      tracheostomy_freq,
      oxygen_requirement,
      dialysis,
      referral_recommended_pt_ot,
      discharge_planning,
      special_precautions,
      isolation_infection_status,
      reviewed_datetime,
      accepted_withdrawn_datetime,
      referral_status,
      case_escalated_to_clinician,
      rejected_reason,
      additional_comments,
      psa_name,
      case_cancelled_reason,
      case_cancelled_date,
      case_cancelled_time,
      case_cancelled_by,
    } = referralOrderData;

    const result = await pool.query(
      `
      INSERT INTO referral_order (
        referral_id, patient_id, order_datetime, comments, provider, community_hospital,
        ward_type, psychiatric_issues, iv_chemo_radiotherapy, parenteral_nutrition,
        bipap_cpap, tracheostomy_freq, oxygen_requirement, dialysis,
        referral_recommended_pt_ot, discharge_planning, special_precautions,
        isolation_infection_status, reviewed_datetime, accepted_withdrawn_datetime,
        referral_status, case_escalated_to_clinician, rejected_reason,
        additional_comments, psa_name, case_cancelled_reason, case_cancelled_date,
        case_cancelled_time, case_cancelled_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `,
      [
        referral_id,
        patient_id,
        order_datetime,
        comments,
        provider,
        community_hospital,
        ward_type,
        psychiatric_issues,
        iv_chemo_radiotherapy,
        parenteral_nutrition,
        bipap_cpap,
        tracheostomy_freq,
        oxygen_requirement,
        dialysis,
        referral_recommended_pt_ot,
        discharge_planning,
        special_precautions,
        isolation_infection_status,
        reviewed_datetime,
        accepted_withdrawn_datetime,
        referral_status,
        case_escalated_to_clinician,
        rejected_reason,
        additional_comments,
        psa_name,
        case_cancelled_reason,
        case_cancelled_date,
        case_cancelled_time,
        case_cancelled_by,
      ]
    );
    return result.rows[0];
  }

  static async update(id, referralOrderData) {
    const {
      referral_id,
      patient_id,
      order_datetime,
      comments,
      provider,
      community_hospital,
      ward_type,
      psychiatric_issues,
      iv_chemo_radiotherapy,
      parenteral_nutrition,
      bipap_cpap,
      tracheostomy_freq,
      oxygen_requirement,
      dialysis,
      referral_recommended_pt_ot,
      discharge_planning,
      special_precautions,
      isolation_infection_status,
      reviewed_datetime,
      accepted_withdrawn_datetime,
      referral_status,
      case_escalated_to_clinician,
      rejected_reason,
      additional_comments,
      psa_name,
      case_cancelled_reason,
      case_cancelled_date,
      case_cancelled_time,
      case_cancelled_by,
    } = referralOrderData;

    const result = await pool.query(
      `
      UPDATE referral_order 
      SET 
        referral_id = $1, patient_id = $2, order_datetime = $3, comments = $4,
        provider = $5, community_hospital = $6, ward_type = $7, psychiatric_issues = $8,
        iv_chemo_radiotherapy = $9, parenteral_nutrition = $10, bipap_cpap = $11,
        tracheostomy_freq = $12, oxygen_requirement = $13, dialysis = $14,
        referral_recommended_pt_ot = $15, discharge_planning = $16, special_precautions = $17,
        isolation_infection_status = $18, reviewed_datetime = $19, accepted_withdrawn_datetime = $20,
        referral_status = $21, case_escalated_to_clinician = $22, rejected_reason = $23,
        additional_comments = $24, psa_name = $25, case_cancelled_reason = $26,
        case_cancelled_date = $27, case_cancelled_time = $28, case_cancelled_by = $29
      WHERE order_id = $30
      RETURNING *
    `,
      [
        referral_id,
        patient_id,
        order_datetime,
        comments,
        provider,
        community_hospital,
        ward_type,
        psychiatric_issues,
        iv_chemo_radiotherapy,
        parenteral_nutrition,
        bipap_cpap,
        tracheostomy_freq,
        oxygen_requirement,
        dialysis,
        referral_recommended_pt_ot,
        discharge_planning,
        special_precautions,
        isolation_infection_status,
        reviewed_datetime,
        accepted_withdrawn_datetime,
        referral_status,
        case_escalated_to_clinician,
        rejected_reason,
        additional_comments,
        psa_name,
        case_cancelled_reason,
        case_cancelled_date,
        case_cancelled_time,
        case_cancelled_by,
        id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM referral_order 
      WHERE order_id = $1 
      RETURNING order_id
    `,
      [id]
    );
    return result.rows[0];
  }

  static async findByPatientId(patientId) {
    const result = await pool.query(
      `
      SELECT ro.*, p.patient_name, p.nric, p.age, p.gender
      FROM referral_order ro
      LEFT JOIN patient p ON ro.patient_id = p.patient_id
      WHERE ro.patient_id = $1
      ORDER BY ro.order_datetime DESC
    `,
      [patientId]
    );
    return result.rows;
  }

  static async findByStatus(status) {
    const result = await pool.query(
      `
      SELECT ro.*, p.patient_name, p.nric, p.age, p.gender
      FROM referral_order ro
      LEFT JOIN patient p ON ro.patient_id = p.patient_id
      WHERE ro.referral_status = $1
      ORDER BY ro.order_datetime DESC
    `,
      [status]
    );
    return result.rows;
  }
  static async startProcess(orderId, psaName) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Update referral_order with reviewed_datetime (using Singapore timezone) and status
      const updateOrderQuery = `
          UPDATE referral_order 
  SET reviewed_datetime = DATE_TRUNC('second', TIMEZONE('Asia/Singapore', CURRENT_TIMESTAMP)),
      psa_name = $1,
      referral_status = 'Started'
  WHERE order_id = $2 AND referral_status = 'Pending'
  RETURNING order_id, patient_id
      `;

      const orderResult = await client.query(updateOrderQuery, [
        psaName,
        orderId,
      ]);

      if (orderResult.rows.length === 0) {
        throw new Error("Order not found or already processed");
      }

      const patientId = orderResult.rows[0].patient_id;

      // 2. Create readiness_screening_checklist record with Singapore timezone
      const createChecklistQuery = `
        INSERT INTO readiness_screening_checklist 
          (patient_id, history_id, screening_datetime, screening_result, notes)
        VALUES ($1, $2, (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore'), 'Pending', 'Initial screening created from referral order process')
        RETURNING readiness_id
      `;

      const checklistResult = await client.query(createChecklistQuery, [
        patientId,
        1,
      ]);

      await client.query("COMMIT");

      return {
        order_id: orderResult.rows[0].order_id,
        readiness_id: checklistResult.rows[0].readiness_id,
        patient_id: patientId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ReferralOrder;
