const { Serial } = require("../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.query;
  try {
    const id = source.id;
    const serial = await Serial.findOne({ where: { id } });
    if (!serial) {
      return res.status(404).json({
        status: "error",
        message: "Serial tidak ditemukan",
      });
    }

    logger.info({ source });
    return res.json({
      status: "success",
      data: serial,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
