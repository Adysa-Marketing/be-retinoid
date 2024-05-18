const { AccountLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  console.log("rource :", source);
  try {
    const schema = {
      name: "string|empty:false",
      amount: "string|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const payload = {
      name: source.name,
      amount: source.amount,
      remark: source.remark,
    };

    logger.info({ source, payload });

    await AccountLevel.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Level Akun berhasil dibuat",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
