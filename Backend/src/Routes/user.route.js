const express = require("express");
const router = express.Router();
const {
  updateSettings,
  updateMedicalInfo,
  getUserProfile,
} = require("../Controllers/user.controller");

// Update user settings
router.put("/settings", updateSettings);

// Update medical information
router.put("/medical", updateMedicalInfo);

// Get user profile
router.get("/:userId", getUserProfile);

module.exports = router;
