const express = require("express");
const router = express.Router();
const {
  classifyEmergency,
  getEmergencyGuidance,
  analyzeEmergency
} = require("../Controllers/aiClassification.controller");

router.post("/classify", classifyEmergency);
router.post("/guidance", getEmergencyGuidance);
router.post("/analyze", analyzeEmergency);

module.exports = router;