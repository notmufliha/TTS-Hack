const MedicalHistory = require('../models/MedicalHistory');

const medicalHistoryController = {
  getAllMedicalHistories: async (req, res) => {
    try {
      const medicalHistories = await MedicalHistory.findAll();
      res.json({
        success: true,
        count: medicalHistories.length,
        medicalHistories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching medical histories',
        error: error.message
      });
    }
  },

  getMedicalHistoryByPatient: async (req, res) => {
    try {
      const medicalHistories = await MedicalHistory.findByPatientId(req.params.patientId);
      res.json({
        success: true,
        count: medicalHistories.length,
        medicalHistories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient medical history',
        error: error.message
      });
    }
  },

  createMedicalHistory: async (req, res) => {
    try {
      const medicalData = req.body;
      
      if (!medicalData.patient_id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      const medicalHistory = await MedicalHistory.create(medicalData);
      res.status(201).json({
        success: true,
        message: 'Medical history created successfully',
        medicalHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating medical history',
        error: error.message
      });
    }
  },

  updateMedicalHistory: async (req, res) => {
    try {
      const medicalHistory = await MedicalHistory.update(req.params.id, req.body);
      if (!medicalHistory) {
        return res.status(404).json({
          success: false,
          message: 'Medical history not found'
        });
      }
      res.json({
        success: true,
        message: 'Medical history updated successfully',
        medicalHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating medical history',
        error: error.message
      });
    }
  }
};

module.exports = medicalHistoryController;