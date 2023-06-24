const {
  User,
  Testimonial,
  SponsorKey,
  Referral,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
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
    const user = await User.findOne({
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "gender",
        "totalDownline",
        "isActive",
        "image",
        "kk",
        "wallet",
      ],
      include: [
        { model: Testimonial },
        { model: SponsorKey },
        {
          model: Referral,
          include: {
            model: SponsorKey,
            include: {
              attributes: ["id", "name"],
              model: User,
            },
          },
        },
      ],
      where: { id, roleId: 4 },
    });

    logger.info(id);
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "Data User tidak ditemukan" });

    return res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
