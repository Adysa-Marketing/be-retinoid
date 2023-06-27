const {
  User,
  Serial,
  Country,
  Province,
  District,
  SubDistrict,
  Role,
  UserBank,
  SponsorKey,
  Agen,
  Testimonial,
  Stokis,
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

    logger.info(req.params);
    const id = req.params;
    const user = await User.findOne({
      attributes: {
        exclud: ["password"],
      },
      where: {
        id,
      },
      raw: true,
      include: [
        {
          attributes: ["id", "name"],
          model: Role,
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
          attributes: ["id", "key"],
          model: SponsorKey,
        },
        {
          attributes: ["id", "rating", "testimonial"],
          model: Testimonial,
        },
        {
          attributes: ["id", "name", "noRekening", "accountName"],
          model: UserBank,
        },
        {
          attributes: ["id", "serialNumber"],
          model: Serial,
        },
        {
          attributes: ["id", "name", "status"],
          model: Agen,
          include: {
            attributes: ["id", "name"],
            model: Stokis,
          },
        },
      ],
    });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Data User tidak ditemukan",
      });

    return res.json({
      status: "success",
      data: User,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
