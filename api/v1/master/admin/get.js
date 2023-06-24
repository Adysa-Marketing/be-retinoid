const { User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const admin = await User.findByPk(id);

    logger.info(id);
    if (!admin)
      return res
        .status(404)
        .json({ status: "error", message: "Data Admin tidak ditemukan" });

    delete admin.password;
    return res.json({
      status: "success",
      data: admin,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
