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
const fs = require("fs-extra");

app.use(userAgent.express());
app.use(requirestIp.mw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
const corsOptions = {
  origin: [
    "https://www.adysaskincare.com",
    "https://adysaskincare.com",
    "https://wabot.adysaskincare.com",
    "https://dasboard.adysaskincare.com",
  ],
};
app.use(cors(corsOptions));

const port = config.port;

// token wabot
global.token = config.token;

setInterval(() => {
  console.log("CLEAR LOGS");
  clearLogs();
}, 15 * 24 * 60 * 60 * 1000); // bersihkan log setiap 15 hari

const clearLogs = () => {
  fs.emptyDirSync("./logs");
};

app.use("/api/v1", router);

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
