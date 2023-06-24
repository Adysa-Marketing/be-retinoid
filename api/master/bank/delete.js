const { Bank } = require("../../../models");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
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

    const id = req.body.id;
    const bank = await Bank.findByPk(id);

    logger.info(id);

    if (!bank)
      return res.status(404).json({
        status: "error",
        message: "Data Bank tidak ditemukan",
      });

    await bank.destroy();
    return res.json({
      status: "success",
      message: "Data Bank berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
