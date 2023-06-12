const app = require("express").Router();

app.use("/", (req, res) => res.send("express"));

module.exports = app;
