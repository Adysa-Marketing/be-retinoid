const { Serial } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const id = source.id;
    const serial = await Serial.findOne({ where: { id, status: 0 } });
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
