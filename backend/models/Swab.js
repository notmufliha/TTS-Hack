const pool = require("../config/database");

class Swab {
  static async findAll() {
    const result = await pool.query(`
      SELECT s.*, p.patient_name 
      FROM swab s
      LEFT JOIN patient p ON s.patient_id = p.patient_id
      ORDER BY s.swab_date DESC
    `);
    return result.rows;
  }

  static async findByPatientId(patientId) {
    const result = await pool.query(
      `
      SELECT s.*, p.patient_name 
      FROM swab s
      LEFT JOIN patient p ON s.patient_id = p.patient_id
      WHERE s.patient_id = $1
      ORDER BY s.swab_date DESC
    `,
      [patientId]
    );
    return result.rows;
  }

  static async create(swabData) {
    const {
      patient_id,
      swab_type,
      swab_date,
      result,
      result_date,
      swab_location,
      notes,
    } = swabData;
    const query = `
      INSERT INTO swab (patient_id, swab_type, swab_date, result, result_date, swab_location, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      patient_id,
      swab_type,
      swab_date,
      result,
      result_date,
      swab_location,
      notes,
    ];

    const dbResult = await pool.query(query, values);
    return dbResult.rows[0];
  }

  static async update(id, swabData) {
    const {
      patient_id,
      swab_type,
      swab_date,
      result,
      result_date,
      swab_location,
      notes,
    } = swabData;
    const query = `
      UPDATE swab 
      SET patient_id = $1, swab_type = $2, swab_date = $3, result = $4, 
          result_date = $5, swab_location = $6, notes = $7
      WHERE swab_id = $8 
      RETURNING *
    `;
    const values = [
      patient_id,
      swab_type,
      swab_date,
      result,
      result_date,
      swab_location,
      notes,
      id,
    ];

    const dbResult = await pool.query(query, values);
    return dbResult.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM swab 
      WHERE swab_id = $1 
      RETURNING swab_id
    `,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Swab;
