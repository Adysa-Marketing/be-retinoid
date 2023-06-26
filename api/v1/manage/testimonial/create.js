const { Testimonial } = require("../../../models");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const schema = {
      rating: "number|empty:false",
      testimonial: "string|empty:false",
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
    await Testimonial.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Terimakasih atas review yang diberikan",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
