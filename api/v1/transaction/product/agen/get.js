const {
  PaymentType,
  Product,
  ProductCategory,
  ATrSale,
  TrStatus,
} = require("../../../../../models");
const logger = require("../../../../../libs/logger");
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

    let aTrSale = await ATrSale.findOne({
      where: { id, userId: user.id },
      include: [
        {
          attributes: ["id", "name"],
          model: TrStatus,
        },
        {
          attributes: ["id", "name"],
          model: PaymentType,
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
    if (!aTrSale)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Produk tidak ditemukan",
      });

    aTrSale.cratedAt = moment(aTrSale.createdAt)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: aTrSale,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
