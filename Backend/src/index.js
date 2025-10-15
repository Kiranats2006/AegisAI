
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}
const connectDatabase = require("./DB/database.js");
const app = require("./app.js");


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;


const server = app.listen(PORT, async () => {
  connectDatabase();
  console.log(
    `The Server is running on Port:${PORT} URL: http://localhost:${PORT}`
  );

});
