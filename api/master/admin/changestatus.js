const { User } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const id = source.id;
    const status = source.isActive;

    if (![1].includes(user.roleId))
      return res.status(405).json({
        status: "error",
        message: "Anda tidak memiliki hak akses",
      });

    const admin = await User.findOne({ where: { id } });
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
