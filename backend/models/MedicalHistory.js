const pool = require('../config/database');

class MedicalHistory {
  static async findAll() {
    const result = await pool.query(`
      SELECT mh.*, p.patient_name, p.age, p.gender
      FROM patient_medical_history mh
      LEFT JOIN patient p ON mh.patient_id = p.patient_id
      ORDER BY mh.last_updated DESC
    `);
    return result.rows;
  }

  static async findByPatientId(patientId) {
    const result = await pool.query(`
      SELECT mh.*, p.patient_name, p.age, p.gender
      FROM patient_medical_history mh
      LEFT JOIN patient p ON mh.patient_id = p.patient_id
      WHERE mh.patient_id = $1
      ORDER BY mh.last_updated DESC
    `, [patientId]);
    return result.rows;
  }

  static async create(medicalData) {
    const {
      patient_id,
      iv_chemo_radiotherapy,
      dialysis,
      parenteral_nutrition,
      psychiatric_issues,
      suicidal_precaution,
      bipap_cpap,
      tracheostomy_freq,
      temperature,
      systolic_bp,
      diastolic_bp,
      pulse,
      respiratory_rate,
      spo2,
      oxygen_level,
      special_circumstance
    } = medicalData;

    const result = await pool.query(`
      INSERT INTO patient_medical_history (
        patient_id, iv_chemo_radiotherapy, dialysis, parenteral_nutrition,
        psychiatric_issues, suicidal_precaution, bipap_cpap, tracheostomy_freq,
        temperature, systolic_bp, diastolic_bp, pulse, respiratory_rate,
        spo2, oxygen_level, special_circumstance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      patient_id, iv_chemo_radiotherapy, dialysis, parenteral_nutrition,
      psychiatric_issues, suicidal_precaution, bipap_cpap, tracheostomy_freq,
      temperature, systolic_bp, diastolic_bp, pulse, respiratory_rate,
      spo2, oxygen_level, special_circumstance
    ]);
    return result.rows[0];
  }

  static async update(historyId, medicalData) {
    const {
      iv_chemo_radiotherapy,
      dialysis,
      parenteral_nutrition,
      psychiatric_issues,
      suicidal_precaution,
      bipap_cpap,
      tracheostomy_freq,
      temperature,
      systolic_bp,
      diastolic_bp,
      pulse,
      respiratory_rate,
      spo2,
      oxygen_level,
      special_circumstance
    } = medicalData;

    const result = await pool.query(`
      UPDATE patient_medical_history 
      SET 
        iv_chemo_radiotherapy = $1, dialysis = $2, parenteral_nutrition = $3,
        psychiatric_issues = $4, suicidal_precaution = $5, bipap_cpap = $6,
        tracheostomy_freq = $7, temperature = $8, systolic_bp = $9,
        diastolic_bp = $10, pulse = $11, respiratory_rate = $12,
        spo2 = $13, oxygen_level = $14, special_circumstance = $15,
        last_updated = CURRENT_TIMESTAMP
      WHERE history_id = $16
      RETURNING *
    `, [
      iv_chemo_radiotherapy, dialysis, parenteral_nutrition,
      psychiatric_issues, suicidal_precaution, bipap_cpap, tracheostomy_freq,
      temperature, systolic_bp, diastolic_bp, pulse, respiratory_rate,
      spo2, oxygen_level, special_circumstance, historyId
    ]);
    return result.rows[0];
  }
}

module.exports = MedicalHistory;