const {
  User,
  Testimonial,
  SponsorKey,
  Referral,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    let user = await User.findOne({
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "gender",
        "point",
        "isActive",
        "image",
        "kk",
        "wallet",
      ],
      include: [
        {
          attributes: ["id", "rating", "testimonial", "remark"],
          model: Testimonial,
        },
        { attributes: ["id", "key"], model: SponsorKey },
        {
          attributes: ["id", "date"],
          model: Referral,
          include: {
            attributes: ["id", "key"],
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

    logger.info({ id });
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "Data User tidak ditemukan" });

    user = JSON.parse(JSON.stringify(user));

    user.Referral.date = moment(user.Referral.date)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

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
