const {
  Bank,
  PaymentType,
  TrStatus,
  TrStokis,
  Stokis,
  User,
  Role,
  Province,
  District,
  SubDistrict,
} = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  const user = req.user;

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
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    const trStokis = await TrStokis.findOne({
      attributes: [
        "id",
        "amount",
        "kk",
        "imageKtp",
        "image",
        "phoneNumber",
        "fromBank",
        "accountName",
        "address",
        "date",
        "remark",
      ],
      where: { id, ...queryMember },
      include: [
        {
          attributes: ["id", "name", "price", "discount", "description"],
          model: Stokis,
        },
        {
          attributes: ["id", "name"],
          model: PaymentType,
        },
        {
          attributes: ["id", "name"],
          model: TrStatus,
        },
        {
          attributes: ["id", "name"],
          model: Bank,
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
          attributes: ["id", "name", "username", "email", "phone", "roleId"],
          model: User,
          include: {
            attributes: ["id", "name"],
            model: Role,
          },
        },
      ],
    });

    logger.info({ id });
    if (!trStokis)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Stokis tidak ditemukan",
      });

    trStokis.date = moment(trStokis.date)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: trStokis,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
