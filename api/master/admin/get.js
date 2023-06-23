const { User } = require("../../../models");
const logger = require("../../../libs");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await User.findOne({ where: { id } });

    logger.info(id);
    if (!admin)
      return res
        .status(404)
        .json({ status: "error", message: "Data Admin tidak ditemukan" });

    delete admin.password;
    return res.json({
      status: "success",
      data: admin,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
