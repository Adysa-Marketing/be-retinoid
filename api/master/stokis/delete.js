const { Stokis } = require("../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const id = source.id;
    const stokis = await Stokis.findOne({ where: { id } });
    if (!stokis) {
      return res.status(404).json({
        status: "error",
        message: "Stokis tidak ditemukan",
      });
    }

    logger.info({ source });
    await stokis.destroy();
    return res.json({
      status: "success",
      message: "Data Stokis berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
