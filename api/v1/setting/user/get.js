const {
  AccountLevel,
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
  AgenStatus,
  Testimonial,
  Stokis,
} = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findOne({
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "gender",
        "kk",
        "image",
        "point",
        "wallet",
        "verCode",
        "address",
        "isActive",
        "remark",
      ],
      where: {
        id,
      },
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
          attributes: ["id", "name"],
          model: Agen,
          include: [
            {
              attributes: ["id", "name", "remark"],
              model: AgenStatus,
            },
            {
              attributes: ["id", "name"],
              model: Stokis,
            },
          ],
        },
        {
          attributes: ["id", "name"],
          model: AccountLevel
        }
      ],
    });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Data User tidak ditemukan",
      });

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
