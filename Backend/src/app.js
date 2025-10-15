const express = require("express");
const cors = require("cors");
const authRoutes = require("./Routes/Auth.route");

if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "./Config/.env" });
}

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to AegisAI Backend" });
});

module.exports = app;
