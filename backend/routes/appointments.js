const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');

router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);

module.exports = router;