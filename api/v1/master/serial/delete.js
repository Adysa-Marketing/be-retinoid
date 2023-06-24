const { Serial } = require("../../../../models");
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
    const serial = await Serial.findByPk(id);
    if (!serial) {
      return res.status(404).json({
        status: "error",
        message: "Serial tidak ditemukan / sudah digunakan",
      });
    }

    logger.info({ source });
    await serial.destroy();
    return res.json({
      status: "success",
      message: "Data Serial berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
