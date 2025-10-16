const express = require("express");
const router = express.Router();
const { transcribeAudio } = require("../Controllers/voice.controller");

// POST /api/voice/transcribe - Transcribe audio to text
router.post("/transcribe", transcribeAudio);

module.exports = router;
