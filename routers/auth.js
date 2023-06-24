const {unless} = require("express-unless");
const logger = require("../libs/logger");
const Session = require("../libs/session");

const Auth = (req, res, next) => {
  const header = req.headers.authorization;
  const source = req.useragen.source;
  const ip = req.clientIp;
  const url = req.originalUrl;

  if (header) {
    const token = header.replace("Bearer ", "");

    Session.verify(token, (err, user) => {
      if (err) {
        logger.error({ err, source, ip, url });
        response(res);
      } else {
        req.token = token;
        req.user = user;
        const name = user.name;
        logger.info({ source, ip, url, name });
        next();
      }
    });
  } else {
    logger.error({ reason: "Header not found", source, ip, url });
    response(res);
  }
  function response(res) {
    res.status(403).json({
      status: "error",
      message: "Forbidden Access",
    });
  }
};

Auth.unless = unless;
module.exports = Auth;
