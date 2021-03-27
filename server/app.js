const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(router)

// error handling
app.use((error, req, res, next) => {
  const { statusCode, message } = error;
  const status = statusCode || 500;
  error.statusCode = statusCode || 500;
  console.log(error);
  res.status(status).json({ message });
});

module.exports = app;
