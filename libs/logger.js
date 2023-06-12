require("winston-daily-rotate-file");
const root = require("app-root-path");
const {
  createLogger,
  format,
  transports,
  addColors,
  transport,
} = require("winston");
const getCallerFile = require("get-caller-file");
const beautify = require("json-beautify");

const options = {
  file: {
    level: "info",
    name: "file.info",
    datePattern: "YYYY-MM-DD",
    filename: `${root}/logs/info-%DATE%.log`,
    handleExceptions: true,
    json: true,
    maxSize: "5m", // 5MB
    maxFiles: "5d",
    colorize: true,
  },
  errorFile: {
    level: "error",
    name: "file.error",
    datePattern: "YYYY-MM-DD",
    filename: `${root}/logs/error-%DATE%.log`,
    handleExceptions: true,
    json: true,
    maxSize: "5m", // 5MB
    maxFiles: "5d",
    colorize: true,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};

const colorizer = format.colorize();
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.simple(),
    format.printf((msg) =>
      colorizer.colorize(msg.level, `${msg.timestamp} - ${msg.message}`)
    )
  ),
  transports: [
    new transports.Console(options.console),
    new transports.DailyRotateFile(options.errorFile),
    new transports.DailyRotateFile(options.file),
  ],
  exitOnError: false,
});

const formattedLogger = {
  info: (message) => {
    if (typeof message === "object") {
      message = beautify(JSON.parse(JSON.stringify(message)), null, 2, 80);
    }
    logger.info(`${getCallerFile()}\n${message}`);
  },
  error: (message) => {
    if (
      typeof message === "object" &&
      message.constructor.name.indexOf("Error") === -1
    )
      message = beautify(JSON.parse(JSON.stringify(message)), null, 2, 80);
    else if (
      typeof message === "object" &&
      message.constructor.name.indexOf("Error") !== -1
    )
      message = message.stack;

    logger.error(`${getCallerFile()}\n${message}`);
  },
};

module.exports = formattedLogger;
