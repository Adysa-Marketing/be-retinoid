const { Stokis } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.body.id;
    const stokis = await Stokis.findOne({ where: { id } });

    logger.info(id)
    if (!stokis)
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });

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
