require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const userAgent = require("express-useragent");
const requirestIp = require("request-ip");
const path = require("path");
const router = require("./routers");
const logger = require("./libs/logger");
const env = process.env.NODE_ENV || "development";
const config = require("./config/core")[env];

app.use(userAgent.express());
app.use(requirestIp.mw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const port = config.port;

app.use('/api/v1', router);

app.listen(port, () => {
  console.log(
    `${require("app-root-path")} app running on [${env}] environment on port : ${port}`
  );
});
process.on("exit", (code) => {
  console.log(`Exit code : ${code}`);
});
process.on("uncaughtException", (err) => {
  logger.error(err);
});
process.on("unhandleRejection", (err) => {
  logger.error(err);
});
