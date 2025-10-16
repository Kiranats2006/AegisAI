const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Please Enter Your Name"] 
    },
    email: {
      type: String,
      required: [true, "Please Enter Email.. "],
      unique: [true, "Please enter Unique Email Address"],
    },
    phone: { 
      type: Number, 
      required: false
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
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;