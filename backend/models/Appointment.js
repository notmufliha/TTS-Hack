const pool = require('../config/database');

class Appointment {
  static async findAll() {
    const result = await pool.query(`
      SELECT a.*, p.patient_name 
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      ORDER BY a.appointment_date DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT a.*, p.patient_name 
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      WHERE a.appointment_id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create(appointmentData) {
    const { patient_id, appointment_date, appointment_type, status, notes } = appointmentData;
    const result = await pool.query(`
      INSERT INTO appointment (patient_id, appointment_date, appointment_type, status, notes) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [patient_id, appointment_date, appointment_type, status, notes]);
    return result.rows[0];
  }

  static async update(id, appointmentData) {
    const { patient_id, appointment_date, appointment_type, status, notes } = appointmentData;
    const result = await pool.query(`
      UPDATE appointment 
      SET patient_id = $1, appointment_date = $2, appointment_type = $3, status = $4, notes = $5 
      WHERE appointment_id = $6 
      RETURNING *
    `, [patient_id, appointment_date, appointment_type, status, notes, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`
      DELETE FROM appointment 
      WHERE appointment_id = $1 
      RETURNING appointment_id
    `, [id]);
    return result.rows[0];
  }

  static async findByPatientId(patientId) {
    const result = await pool.query(`
      SELECT a.*, p.patient_name 
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC
    `, [patientId]);
    return result.rows;
  }
}

module.exports = Appointment;