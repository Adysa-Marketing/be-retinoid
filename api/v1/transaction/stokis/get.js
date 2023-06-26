const {
  Bank,
  PaymentStatus,
  PaymentType,
  TrStokis,
  Stokis,
  User,
} = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;

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

    const id = req.body.id;
    const queryMember = [4].includes(user.id) ? { userId: user.id } : {};

    const trStokis = await TrStokis.findOne({
      where: { id, ...queryMember },
      includes: [
        {
          model: Stokis,
        },
        {
          model: PaymentType,
        },
        {
          model: PaymentStatus,
        },
        {
          model: Bank,
        },
        {
          attributes: ["id", "name", "username", "email", "phone"],
          model: User,
        },
      ],
    });

    logger.info(id);
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
