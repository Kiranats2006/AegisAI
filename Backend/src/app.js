const express = require("express");
const cors = require("cors");

const authRoutes = require("./Routes/Auth.route");
const contactsRoutes = require("./Routes/contacts.route");
const aiRoutes = require("./Routes/ai.route");
<<<<<<< HEAD
const emergencyRoutes = require("./Routes/emergency.route");
const voiceRoutes = require("./Routes/voice.route");
=======
const emergencyRoutes = require("./Routes/emergency.route")
const notificationRoutes=require("./Routes/notification.route")

>>>>>>> 16b403b534d9bd4ad71116b0dc66e50215abc82a

if (process.env.NODE_ENV !== "PRODUCTION") {
  const path = require("path");
  require("dotenv").config({
    path: path.join(__dirname, "Config", ".env"),
  });
}

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emergencies", contactsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/emergency", emergencyRoutes);
<<<<<<< HEAD
app.use("/api/voice", voiceRoutes);
=======
app.use("/api/notify", notificationRoutes);
>>>>>>> 16b403b534d9bd4ad71116b0dc66e50215abc82a

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AegisAI Backend" });
});

module.exports = app;
