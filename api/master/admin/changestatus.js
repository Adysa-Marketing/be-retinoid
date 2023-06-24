const { User } = require("../../../models");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      isActive: "boolean|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const status = source.isActive;

    logger.info(source);
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
