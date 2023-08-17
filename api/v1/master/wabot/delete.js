const { WaBot } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.body.id;
    const waBot = await WaBot.findOne({ where: { id } });
    if (!waBot) {
      return res.status(404).json({
        status: "error",
        message: "WA BOT tidak ditemukan / sudah digunakan",
      });
    }
    let key = waBot.key;

    logger.info({ id });
    await waBot.destroy();
    return res.json({
      status: "success",
      message: "Data WA BOT berhasil dihapus",
      key: key,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
