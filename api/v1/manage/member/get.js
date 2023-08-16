const {
  User,
  Testimonial,
  SponsorKey,
  Referral,
  Country,
  Province,
  District,
  SubDistrict,
  Role,
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
        "address",
        "countryId",
        "provinceId",
        "districtId",
        "subDistrictId",
        "remark",
      ],
      include: [
        {
          attributes: ["id", "rating", "testimonial", "remark"],
          model: Testimonial,
        },
        {
          attributes: ["id", "key"],
          model: SponsorKey,
          include: {
            attributes: ["id", "date"],
            model: Referral,
            limit: 10,
            order: [["id", "DESC"]],
            include: {
              attributes: ["id", "name", "image", "point", "roleId"],
              model: User,
              include: {
                attributes: ["name"],
                model: District,
              },
            },
          },
        },
        {
          attributes: ["id", "date"],
          model: Referral,
          include: {
            attributes: ["id", "key"],
            model: SponsorKey,
            include: {
              attributes: ["id", "name", "image"],
              model: User,
            },
          },
        },
        {
          attributes: ["id", "name"],
          model: Country,
        },
        {
          attributes: ["id", "name"],
          model: Province,
        },
        {
          attributes: ["id", "name"],
          model: District,
        },
        {
          attributes: ["id", "name"],
          model: SubDistrict,
        },
        {
          attributes: ["id", "name"],
          model: Role,
        },
      ],
      where: { id, roleId: 4 },
    });

    logger.info({ id });
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
