const { Bank } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const bank = await Bank.findOne({ where: { id } });

    logger.info(id);
    if (!bank)
      return res.status(404).json({
        status: "error",
        message: "Data Bank tidak ditemukan",
      });

    return res.json({ status: "success", data: bank });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
