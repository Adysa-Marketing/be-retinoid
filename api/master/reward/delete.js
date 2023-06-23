const { Reward } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.body.id;
    const reward = await Reward.findOne({ where: { id } });

    logger.info(id);
    if (!reward)
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });

    await RemoveFile(reward, true);
    await reward.destroy();

    return res.json({
      status: "success",
      message: "Data Reward berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
