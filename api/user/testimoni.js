const { Testimonial } = require("../../models");
const logger = require("../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const payload = {
      userId: source.userId,
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
