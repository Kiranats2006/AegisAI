const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Email.. "],
      unique: [true, "Please enter Unique Email Address"],
    },
    phone: {
      type: Number,
      required: false,
    },
    emergencyContact: [
      {
        name: { type: String },
        phone: { type: Number },
      },
    ],
    medicalInformation: {
      bloodType: { type: String },
      allergies: [{ name: { type: String } }],
      conditions: [{ name: { type: String } }],
      medications: [{ name: { type: String } }],
      emergencyNotes: { type: String },
    },
    settings: {
      notifications: {
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
      privacy: {
        shareLocation: { type: Boolean, default: true },
        shareMedicalInfo: { type: Boolean, default: true },
        autoEmergency: { type: Boolean, default: true },
      },
      preferences: {
        language: { type: String, default: "en" },
        theme: { type: String, default: "dark" },
        voiceGuidance: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
