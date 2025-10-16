const request = require("supertest");
const express = require("express");

// Mock the Google Cloud Speech client BEFORE requiring anything that uses it
const mockRecognize = jest.fn();
jest.mock("@google-cloud/speech", () => {
  return {
    SpeechClient: jest.fn(() => ({
      recognize: mockRecognize,
    })),
  };
});

// Now require the router (which requires the controller)
const voiceRouter = require("../Routes/voice.route");

describe("Voice Controller - transcribeAudio", () => {
  let app;

  beforeEach(() => {
    // Create Express app with voice routes
    app = express();
    app.use(express.json());
    app.use("/api/voice", voiceRouter);

    // Reset mocks
    mockRecognize.mockClear();
  });

  describe("POST /api/voice/transcribe - Success Cases", () => {
    test("should successfully transcribe a valid audio file", async () => {
      // Mock successful transcription response
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Hello, this is a test transcription",
                  confidence: 0.95,
                },
              ],
            },
          ],
        },
      ]);

      // Create a mock audio buffer
      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test-audio.wav",
          contentType: "audio/wav",
        })
        .field("languageCode", "en-US")
        .field("sampleRate", "16000");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transcription).toBe(
        "Hello, this is a test transcription"
      );
      expect(response.body.confidence).toBeCloseTo(0.95);
      expect(response.body.language).toBe("en-US");
      expect(mockRecognize).toHaveBeenCalledTimes(1);
    });

    test("should handle MP3 audio files with correct encoding", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "MP3 test",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-mp3-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.mp3",
          contentType: "audio/mpeg",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify that MP3 encoding was used
      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.encoding).toBe("MP3");
    });

    test("should handle FLAC audio files", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "FLAC test",
                  confidence: 0.92,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-flac-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.flac",
          contentType: "audio/flac",
        });

      expect(response.status).toBe(200);
      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.encoding).toBe("FLAC");
    });

    test("should handle OGG/WebM audio files", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "OGG test",
                  confidence: 0.88,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-ogg-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.ogg",
          contentType: "audio/ogg",
        });

      expect(response.status).toBe(200);
      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.encoding).toBe("OGG_OPUS");
    });

    test("should handle multiple transcription results", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "First sentence",
                  confidence: 0.95,
                },
              ],
            },
            {
              alternatives: [
                {
                  transcript: "Second sentence",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(200);
      expect(response.body.transcription).toBe(
        "First sentence\nSecond sentence"
      );
      expect(response.body.confidence).toBeCloseTo(0.925); // Average of 0.95 and 0.9
    });

    test("should return empty transcription when no speech detected", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "silent.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transcription).toBe("");
      expect(response.body.message).toBe(
        "No speech detected in the audio file"
      );
      expect(response.body.confidence).toBe(0);
    });

    test("should parse sampleRate as integer when provided", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Test",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        })
        .field("sampleRate", "44100");

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.sampleRateHertz).toBe(44100);
      expect(typeof callArgs.config.sampleRateHertz).toBe("number");
    });

    test("should not include sampleRateHertz when not provided", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Test",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.sampleRateHertz).toBeUndefined();
    });
  });

  describe("POST /api/voice/transcribe - Error Cases", () => {
    test("should return 400 when no audio file is provided", async () => {
      const response = await request(app).post("/api/voice/transcribe");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("No audio file provided");
    });

    test("should return 400 for invalid file type", async () => {
      const textBuffer = Buffer.from("This is not audio");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", textBuffer, {
          filename: "test.txt",
          contentType: "text/plain",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid file");
    });

    test("should return 400 when file size exceeds limit", async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", largeBuffer, {
          filename: "large.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("File upload error");
    });

    test("should return 500 when Google Speech API fails", async () => {
      mockRecognize.mockRejectedValue(
        new Error("Google API authentication failed")
      );

      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Transcription failed");
      expect(response.body.message).toContain(
        "Google API authentication failed"
      );
    });

    test("should handle missing alternatives in response gracefully", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: null, // Missing alternatives
            },
            {
              alternatives: [], // Empty alternatives
            },
            {
              alternatives: [
                {
                  transcript: "Valid transcript",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transcription).toBe("Valid transcript");
      expect(response.body.confidence).toBeCloseTo(0.9);
    });

    test("should handle missing confidence values", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "No confidence",
                  // confidence is missing
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      const response = await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.confidence).toBe(0);
    });
  });

  describe("POST /api/voice/transcribe - Configuration", () => {
    test("should use custom language code when provided", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Bonjour",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        })
        .field("languageCode", "fr-FR");

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.languageCode).toBe("fr-FR");
    });

    test("should default to en-US when no language code provided", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Hello",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.languageCode).toBe("en-US");
    });

    test("should enable automatic punctuation", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Hello, world!",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.enableAutomaticPunctuation).toBe(true);
    });

    test("should not include useEnhanced in config", async () => {
      mockRecognize.mockResolvedValue([
        {
          results: [
            {
              alternatives: [
                {
                  transcript: "Test",
                  confidence: 0.9,
                },
              ],
            },
          ],
        },
      ]);

      const audioBuffer = Buffer.from("fake-audio-data");

      await request(app)
        .post("/api/voice/transcribe")
        .attach("audio", audioBuffer, {
          filename: "test.wav",
          contentType: "audio/wav",
        });

      const callArgs = mockRecognize.mock.calls[0][0];
      expect(callArgs.config.useEnhanced).toBeUndefined();
    });
  });
});
