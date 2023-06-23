const { Stokis } = require("../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const stokis = await Stokis.findOne({ where: { id } });
    if (!stokis) {
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });
    }

    logger.info({ source });
    return res.json({
      status: "success",
      data: stokis,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
