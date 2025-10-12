const Swab = require('../models/Swab');

const swabController = {
  getAllSwabs: async (req, res) => {
    try {
      const swabs = await Swab.findAll();
      res.json({
        success: true,
        count: swabs.length,
        swabs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching swabs',
        error: error.message
      });
    }
  },

  getSwabById: async (req, res) => {
    try {
      const swab = await Swab.findById(req.params.id);
      if (!swab) {
        return res.status(404).json({
          success: false,
          message: 'Swab test not found'
        });
      }
      res.json({
        success: true,
        swab
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching swab test',
        error: error.message
      });
    }
  },

  createSwab: async (req, res) => {
    try {
      const { patient_id, swab_type, swab_date, result, result_date, swab_location, notes } = req.body;
      
      if (!patient_id || !swab_type || !swab_date) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID, swab type and date are required'
        });
      }

      const swab = await Swab.create({
        patient_id,
        swab_type,
        swab_date,
        result: result || 'pending',
        result_date,
        swab_location,
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Swab test created successfully',
        swab
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating swab test',
        error: error.message
      });
    }
  },

  updateSwab: async (req, res) => {
    try {
      const swab = await Swab.update(req.params.id, req.body);
      if (!swab) {
        return res.status(404).json({
          success: false,
          message: 'Swab test not found'
        });
      }
      res.json({
        success: true,
        message: 'Swab test updated successfully',
        swab
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating swab test',
        error: error.message
      });
    }
  },

  deleteSwab: async (req, res) => {
    try {
      const swab = await Swab.delete(req.params.id);
      if (!swab) {
        return res.status(404).json({
          success: false,
          message: 'Swab test not found'
        });
      }
      res.json({
        success: true,
        message: 'Swab test deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting swab test',
        error: error.message
      });
    }
  },

  getSwabsByPatient: async (req, res) => {
    try {
      const swabs = await Swab.findByPatientId(req.params.patientId);
      res.json({
        success: true,
        count: swabs.length,
        swabs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient swab tests',
        error: error.message
      });
    }
  }
};

module.exports = swabController;