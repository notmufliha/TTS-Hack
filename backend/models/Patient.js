const pool = require("../config/database");

class Patient {
  static async findAll() {
    const result = await pool.query(`
      SELECT patient_id, patient_name, nric, age, gender, created_at 
      FROM patient 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `
      SELECT patient_id, patient_name, nric, age, gender, created_at 
      FROM patient
      WHERE patient_id = $1
    `,
      [id]
    );
    return result.rows[0];
  }

  static async create(patientData) {
    const { patient_name, nric, age, gender } = patientData;
    const result = await pool.query(
      `
      INSERT INTO patient (patient_name, nric, age, gender) 
      VALUES ($1, $2, $3, $4) 
      RETURNING patient_id, patient_name, nric, age, gender, created_at
    `,
      [patient_name, nric, age, gender]
    );
    return result.rows[0];
  }

  static async update(id, patientData) {
    const { patient_name, nric, age, gender } = patientData;
    const result = await pool.query(
      `
      UPDATE patient
      SET patient_name = $1, nric = $2, age = $3, gender = $4 
      WHERE patient_id = $5 
      RETURNING patient_id, patient_name, nric, age, gender, created_at
    `,
      [patient_name, nric, age, gender, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM patient
      WHERE patient_id = $1 
      RETURNING patient_id
    `,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Patient;
