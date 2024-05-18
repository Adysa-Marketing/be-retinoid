const { AccountLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }
    const id = req.params.id;
    const accountLevel = await AccountLevel.findOne({
      attributes: ["id", "name", "amount", "remark"],
      where: { id },
    });

    logger.info({ id });

    if (!accountLevel)
      return res.status(404).json({
        status: "error",
        message: "Data Level Akun tidak ditemukan",
      });

    return res.json({
      status: "success",
      data: accountLevel,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
