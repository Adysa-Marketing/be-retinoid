const { User } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const id = source.id;
    const status = source.isActive;

    logger.info({ is, status });
    const admin = await User.findByPk(id);
    if (!admin)
      return res.status(404).json({
        status: "error",
        message: "Data Admin tidak ditemukan",
      });

    await admin.update({ isActive: status });
    return res.status(404).json({
      status: "success",
      message: "Status Admin berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
