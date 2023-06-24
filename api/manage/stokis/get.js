const { Stokis } = require("../../../models");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const stokis = await Stokis.findOne({ where: { id } });

    logger.info(id);
    if (!stokis)
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });

    return res.json({
      status: "success",
      data: stokis,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
