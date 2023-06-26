const { Testimonial } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const schema = {
      id: "number|empty:false",
      rating: "number|optional",
      testimonial: "string|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      userId: user.id,
      rating: source.rating,
      testimonial: source.testimonial,
      remark: source.remark,
    };

    logger.info({ source, payload });
    const testimoni = await Testimonial.findByPk(source.id);
    if (!testimoni)
      return res.status(400).json({
        status: "errorr",
        message: "Data Testimoni tidak ditemukan",
      });

    await testimoni.update(payload);
    return res.status(200).json({
      status: "success",
      message: "Data Testimoni berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
