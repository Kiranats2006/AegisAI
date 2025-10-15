const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Name: { type: String, required: [true, "Please Enter Your Name"] },
    email: {
      type: String,
      required: [true, "Please Enter Email.. "],
      unique: [true, "Please enter Unique Email Address"],
    },
    phone: { type: Number, required: [true, "Please Enter phone number"] },
    password: {
      type: String,
      required: [true, "Please enter the password..."],
    },
    emergencyContact: [
      {
        Name: { type: String },
        phone: { type: Number },
      },
    ],
    medicalInformation: {
      bloodType: { type: String },
      allergies: [{ Name: { type: String } }],
      conditions: [{ Name: { type: String } }],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
