const userService = require("../services/userServices");
const RESPONSE_STATUS = require("../libs/helper/response");
const logger = require("../../libs/logger");

module.exports = {
  async register(req, res) {
    try {
      const payload = req.body;
      const result = await userService.createUser(payload);
      res.status(201).json({
        status: RESPONSE_STATUS.SUCCESS,
        result,
      });
    } catch (error) {
      logger.error(error);
      if (err.errors && err.errors.length > 0 && err.errors[0].path) {
        logger.err(err.errors);
        if (err.errors[0].path == "email") {
          return res.status(400).json({
            status: RESPONSE_STATUS.ERROR,
            message: "Email sudah terdaftar, silahkan gunakan email lain",
          });
        } else if (err.errors[0].path == "username") {
          return res.status(400).json({
            status: RESPONSE_STATUS.ERROR,
            message: "Username sudah terdaftar, silahkan gunakan username lain",
          });
        } else {
          return res.status(400).json({
            status: RESPONSE_STATUS.ERROR,
            message: "No HP sudah terdaftar, silahkan gunakan No HP lain",
          });
        }
      } else {
        return res.status(500).json({
          status: RESPONSE_STATUS.ERROR,
          message: err.message,
        });
      }
    }
  },
};
