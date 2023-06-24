const { Stokis } = require("../../models");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const stokis = await Stokis.findOne({ where: { id } });
    if (!stokis) {
      return res.status(404).json({
        status: "error",
        message: "Stokis tidak ditemukan",
      });
    }

    logger.info({ source });
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
