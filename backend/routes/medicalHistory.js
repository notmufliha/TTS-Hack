const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controller/medicalHistoryController');

router.get('/', medicalHistoryController.getAllMedicalHistories);
router.get('/patient/:patientId', medicalHistoryController.getMedicalHistoryByPatient);
router.post('/', medicalHistoryController.createMedicalHistory);
router.put('/:id', medicalHistoryController.updateMedicalHistory);

module.exports = router;