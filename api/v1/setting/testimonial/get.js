const { Testimonial } = require("../../../../models");

module.exports = async (req, res) => {
  const user = req.user;
  try {
    // get own testimoni
    const testimoni = await Testimonial.findOne({
      attributes: ["id", "rating", "testimonial", "remark"],
      where: { userId: user.id },
    });

    if (!testimoni)
      return res.status(404).json({
        status: "error",
        message: "Data Testimonial tidak ditemukan",
      });

    return res.json({ status: "success", data: testimoni });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
