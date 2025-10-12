const Appointment = require('../models/Appointment');

const appointmentController = {
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll();
      res.json({
        success: true,
        count: appointments.length,
        appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error.message
      });
    }
  },

  getAppointmentById: async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      res.json({
        success: true,
        appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointment',
        error: error.message
      });
    }
  },

  createAppointment: async (req, res) => {
    try {
      const { patient_id, appointment_date, appointment_type, status, notes } = req.body;
      
      if (!patient_id || !appointment_date || !appointment_type) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID, appointment date and type are required'
        });
      }

      const appointment = await Appointment.create({
        patient_id,
        appointment_date,
        appointment_type,
        status: status || 'Scheduled',
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating appointment',
        error: error.message
      });
    }
  },

  updateAppointment: async (req, res) => {
    try {
      const appointment = await Appointment.update(req.params.id, req.body);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      res.json({
        success: true,
        message: 'Appointment updated successfully',
        appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating appointment',
        error: error.message
      });
    }
  },

  deleteAppointment: async (req, res) => {
    try {
      const appointment = await Appointment.delete(req.params.id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      res.json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting appointment',
        error: error.message
      });
    }
  },

  getAppointmentsByPatient: async (req, res) => {
    try {
      const appointments = await Appointment.findByPatientId(req.params.patientId);
      res.json({
        success: true,
        count: appointments.length,
        appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient appointments',
        error: error.message
      });
    }
  }
};

module.exports = appointmentController;