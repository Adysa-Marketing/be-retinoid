const { User, SponsorKey, Referral } = require("../../../../models");
const logger = require("../../../../libs/logger");
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
    const admin = await User.findOne({
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
      where: { id, roleId: 2 },
    });

    logger.info({ id });
    if (!admin)
      return res
        .status(404)
        .json({ status: "error", message: "Data Admin tidak ditemukan" });

    delete admin.password;
    return res.json({
      status: "success",
      data: admin,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
