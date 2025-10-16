const express = require("express");
const router = express.Router();
const {
  triggerEmergency,
  getEmergencyStatus,
  resolveEmergency,
  completeStep,
  getEmergencyHistory,
  getAnalyticsStats
} = require("../Controllers/emergency.controller");


router.post("/trigger", triggerEmergency);
router.get("/:id/status", getEmergencyStatus);
router.put("/:id/resolve", resolveEmergency);
router.post("/:id/step-complete", completeStep);
router.get("/history", getEmergencyHistory);
router.get("/analytics/stats", getAnalyticsStats);

module.exports = router;