const express = require("express");
const router = express.Router();
const swabController = require("../controller/swabController");

router.get("/", swabController.getAllSwabs);
router.get("/:id", swabController.getSwabById);
router.post("/", swabController.createSwab);
router.put("/:id", swabController.updateSwab);
router.delete("/:id", swabController.deleteSwab);
router.get("/patient/:patientId", swabController.getSwabsByPatient);

module.exports = router;
