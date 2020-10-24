const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "build")));

// Set up sequelize
const { sequelize } = require("./api/database/instance.js");

app.get("/ping", async (req, res) => {
  const responses = await sequelize.models.Response.findAll();
  console.log(responses);
  return res.send("pong");
});

app.get("/", async (req, res) => {
  return res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(`✅  Backend listening on port ${port}`)
);

module.exports = server;
