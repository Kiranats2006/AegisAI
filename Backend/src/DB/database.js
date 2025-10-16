if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "../config/.env",
  });
}

const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const con = mongoose.connect(process.env.DB_URL);
    console.log(`Database connected: ${(await con).connection.host}`);
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
  }
};

module.exports = connectDatabase;