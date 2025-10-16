const speech = require("@google-cloud/speech");
const multer = require("multer");

// Configure multer for memory storage (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedMimes = [
      "audio/wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/webm",
      "audio/ogg",
      "audio/flac",
      "audio/x-m4a",
      "audio/mp4",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
}).single("audio");

// Initialize Google Speech-to-Text client
const client = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH || undefined,
  // If no credentials file, will use GOOGLE_APPLICATION_CREDENTIALS env var
});

/**
 * Transcribe audio file to text
 * POST /api/voice/transcribe
 */
const transcribeAudio = async (req, res) => {
  try {
    // Handle file upload
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          error: "File upload error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: "Invalid file",
          message: err.message,
        });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No audio file provided",
          message: "Please upload an audio file",
        });
      }

      try {
        // Get audio content from buffer
        const audioBytes = req.file.buffer.toString("base64");

        // Determine audio encoding based on mimetype (best-effort)
        let encoding = "LINEAR16";
        const mimetype = req.file.mimetype || "";

        if (
          mimetype.includes("mp3") ||
          mimetype.includes("mpeg") ||
          mimetype === "audio/mpeg"
        ) {
          encoding = "MP3";
        } else if (mimetype.includes("flac")) {
          encoding = "FLAC";
        } else if (mimetype.includes("webm") || mimetype.includes("ogg")) {
          // webm/ogg often contain opus
          encoding = "OGG_OPUS";
        } else if (mimetype.includes("wav") || mimetype.includes("wave")) {
          encoding = "LINEAR16";
        }

        // Configure audio settings
        const audio = {
          content: audioBytes,
        };

        // Get language code from request or default to English
        const languageCode = req.body.languageCode || "en-US";

        // Parse sample rate if provided; include only when valid number
        const parsedSampleRate =
          req.body && req.body.sampleRate
            ? parseInt(req.body.sampleRate, 10)
            : undefined;
        const config = {
          encoding: encoding,
          // only include sampleRateHertz if the client supplied a valid number
          ...(Number.isFinite(parsedSampleRate)
            ? { sampleRateHertz: parsedSampleRate }
            : {}),
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: "default",
        };

        const request = {
          audio: audio,
          config: config,
        };

        // Perform speech recognition
        const [response] = await client.recognize(request);

        if (!response.results || response.results.length === 0) {
          return res.status(200).json({
            success: true,
            transcription: "",
            message: "No speech detected in the audio file",
            confidence: 0,
          });
        }

        // Extract transcription from results
        // Extract transcription safely from results
        const transcription = response.results
          .map((result) => {
            const alt = result.alternatives && result.alternatives[0];
            return alt && alt.transcript ? alt.transcript : "";
          })
          .filter(Boolean)
          .join("\n");

        // Get confidence score (average of available confidences)
        const confidenceScores = response.results
          .map((result) => {
            const alt = result.alternatives && result.alternatives[0];
            return typeof (alt && alt.confidence) === "number"
              ? alt.confidence
              : null;
          })
          .filter((c) => c !== null);
        const averageConfidence =
          confidenceScores.length > 0
            ? confidenceScores.reduce((a, b) => a + b, 0) /
              confidenceScores.length
            : 0;

        res.status(200).json({
          success: true,
          transcription: transcription,
          confidence: averageConfidence,
          language: languageCode,
          audioInfo: {
            size: req.file.size,
            mimetype: req.file.mimetype,
            encoding: encoding,
          },
        });
      } catch (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        res.status(500).json({
          success: false,
          error: "Transcription failed",
          message: transcriptionError.message || "Failed to transcribe audio",
        });
      }
    });
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message || "An unexpected error occurred",
    });
  }
};

module.exports = {
  transcribeAudio,
};
