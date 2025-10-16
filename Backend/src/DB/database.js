// Load workaround FIRST to intercept MongoDB module loads
require("../Utils/workaround.js");

// Note: dotenv is loaded in index.js, no need to load it again here
const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const con = mongoose.connect(process.env.MONGO_URI);
    console.log(
      `===================\nDatabase connected: ${
        (await con).connection.host
      }\n===================`
    );
  } catch (error) {
    console.error(
      "===================\nDatabase Connection Failed:",
      error.message,
      "\n==================="
    );
  }
};

// connectDatabase();
module.exports = connectDatabase;
