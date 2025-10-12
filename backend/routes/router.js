const express = require("express");
const router = express.Router();

const patientRoutes = require("./patients");
const appointmentRoutes = require("./appointments");
const medicalHistoryRoutes = require("./medicalHistory");
const swabRoutes = require("./swabs");
const referralOrderRoutes = require("./referralOrders");

router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/medical-history", medicalHistoryRoutes);
router.use("/swabs", swabRoutes);
router.use("/referral-orders", referralOrderRoutes);
module.exports = router;
