const { Reward } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Reward.findOne({ where: { id } });

    if (!data)
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });
    logger.info(id);
    return res.json({ status: "success", data });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
