const { Testimonial } = require("../../../../models");
const logger = require("../../../../libs/logger");
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
    const testomoni = await Testimonial.findByPk(id);

    logger.info({ id });
    if (!testomoni)
      return res.status(404).json({
        status: "error",
        message: "Data Testimonial tidak ditemukan",
      });

    await testomoni.destroy();

    return res.json({
      status: "success",
      message: "Data Testimonial berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
