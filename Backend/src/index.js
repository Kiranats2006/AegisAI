if (process.env.NODE_ENV !== "PRODUCTION") {
  const path = require("path");
  require("dotenv").config({
    path: path.join(__dirname, "Config", ".env"),
  });
}
const connectDatabase = require("./DB/database.js");
const app = require("./app.js");
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, async () => {
  connectDatabase();
  console.log(
    `The Server is running on Port:${PORT} URL: http://localhost:${PORT}`
  );
});
