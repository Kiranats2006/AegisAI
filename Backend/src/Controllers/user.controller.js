const User = require("../Model/users.model");

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const { userId } = req.body;
    const settings = req.body.settings || req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { settings },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Settings updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update medical information
const updateMedicalInfo = async (req, res) => {
  try {
    const {
      userId,
      bloodType,
      allergies,
      conditions,
      medications,
      emergencyNotes,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const medicalInformation = {
      bloodType,
      allergies,
      conditions,
      medications,
      emergencyNotes,
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { medicalInformation },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Medical information updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update medical info error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateSettings, updateMedicalInfo, getUserProfile };
