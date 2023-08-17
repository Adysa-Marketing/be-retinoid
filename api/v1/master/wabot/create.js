const { WaBot } = require("../../../../models");
const logger = require("../../../../libs/logger");
const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      name: "string|empty:false",
      phone: "string|optional|min:9|max:13",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      name: source.name,
      phone: source.phone,
      key: cryptoString({ length: 10, type: "base64" }),
      status: 0,
    };
    logger.info({ source, payload });

    const checkData = await WaBot.findAll();
    if (checkData.length) {
      return res.status(400).json({
        status: "error",
        message: "Mohon Maaf, WA BOT Sudah tersedia",
      });
    }

    const data = await WaBot.create(payload);
    return res.status(201).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
