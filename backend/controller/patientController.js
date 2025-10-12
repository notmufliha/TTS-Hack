const Patient = require('../models/Patient');

const patientController = {
  getAllPatients: async (req, res) => {
    try {
      const patients = await Patient.findAll();
      res.json({
        success: true,
        count: patients.length,
        patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patients',
        error: error.message
      });
    }
  },

  getPatientById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      res.json({
        success: true,
        patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient',
        error: error.message
      });
    }
  },

  createPatient: async (req, res) => {
    try {
      const { patient_name, nric, age, gender } = req.body;
      
      if (!patient_name || !nric) {
        return res.status(400).json({
          success: false,
          message: 'Patient name and NRIC are required'
        });
      }

      const patient = await Patient.create({ patient_name, nric, age, gender });
      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        patient
      });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'NRIC already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error creating patient',
        error: error.message
      });
    }
  },

  updatePatient: async (req, res) => {
    try {
      const patient = await Patient.update(req.params.id, req.body);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      res.json({
        success: true,
        message: 'Patient updated successfully',
        patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating patient',
        error: error.message
      });
    }
  },

  deletePatient: async (req, res) => {
    try {
      const patient = await Patient.delete(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting patient',
        error: error.message
      });
    }
  }
};

module.exports = patientController;