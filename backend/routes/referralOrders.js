const express = require("express");
const router = express.Router();
const referralOrderController = require("../controller/referralOrderController");

router.get("/", referralOrderController.getAllReferralOrders);
router.get("/:id", referralOrderController.getReferralOrderById);
router.post("/", referralOrderController.createReferralOrder);
router.post("/start-process", referralOrderController.startProcess);
router.put("/:id", referralOrderController.updateReferralOrder);
router.delete("/:id", referralOrderController.deleteReferralOrder);
router.get(
  "/patient/:patientId",
  referralOrderController.getReferralOrdersByPatient
);
router.get(
  "/status/:status",
  referralOrderController.getReferralOrdersByStatus
);

module.exports = router;
