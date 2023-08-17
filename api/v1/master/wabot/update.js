const { WaBot } = require("../../../../models");
const logger = require("../../../../libs/logger");
const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      phone: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;

    const payload = {
      name: source.name,
      phone: source.phone,
    };
    logger.info({ source, payload });

    const waBot = await WaBot.findOne({ where: { id } });
    if (!waBot) {
      return res.status(404).json({
        status: "Error",
        message: "Data WA BOT tidak ditemukan",
      });
    }

    await waBot.update(payload);

    return res.status(201).json({
      status: "success",
      message: "Data WA BOT berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
