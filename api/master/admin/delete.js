const { User } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.body.id;
    const admin = await User.findOne({ where: { id } });

    logger.info(id);
    if (!admin)
      return res.status(404).json({
        status: "error",
        message: "Data Admin tidak ditemukan",
      });

    await RemoveFile(admin, true);
    await admin.destroy();

    return res.json({
      status: "success",
      message: "Data Admin berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
