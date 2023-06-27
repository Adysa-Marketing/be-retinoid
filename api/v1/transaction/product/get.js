const {
  Bank,
  PaymentType,
  Product,
  ProductCategory,
  TrSale,
  TrStatus,
  User,
} = require("../../../../models");
const logger = require("../../../../libs/logger");

const moment = require("moment");
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

    const id = req.params.id;
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    let trSale = await TrSale.findOne({
      where: { id, ...queryMember },
      include: [
        {
          attributes: ["id", "name", "email", "phone"],
          model: User,
        },
        {
          attributes: ["id", "name"],
          model: TrStatus,
        },
        {
          attributes: ["id", "name"],
          model: PaymentType,
        },
        {
          attributes: ["id", "name"],
          model: Bank,
        },
        {
          attributes: ["id", "name", "amount", "image"],
          model: Product,
          include: {
            attributes: ["id", "name"],
            model: ProductCategory,
          },
        },
      ],
    });

    logger.info(id);
    if (!trSale)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Data Transaksi Produk tidak ditemukan",
        });

    trSale.date = moment(trSale.date)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: trSale,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
