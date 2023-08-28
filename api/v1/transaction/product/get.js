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
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};

    let trSale = await TrSale.findOne({
      attributes: [
        "id",
        "amount",
        "discount",
        "paidAmount",
        "qty",
        "image",
        "fromBank",
        "accountName",
        "date",
        "address",
        "remark",
      ],
      where: { id, ...queryAgen },
      include: [
        {
          attributes: ["id", "name", "username", "phone"],
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
          attributes: ["id", "name", "noRekening"],
          model: Bank,
        },
        {
          attributes: ["id", "name", "amount", "image", "stock"],
          model: Product,
          include: {
            attributes: ["id", "name"],
            model: ProductCategory,
          },
        },
      ],
    });

    logger.info({ id });
    if (!trSale)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Produk tidak ditemukan",
      });

    trSale = JSON.parse(JSON.stringify(trSale));

    if (
      [1, 2].includes(trSale.Product?.ProductCategory?.id) &&
      [3].includes(user.roleId)
    ) {
      let discount = 0;
      discount =
        trSale.Product?.ProductCategory?.id == 1
          ? parseInt(user.profit) * 2
          : trSale.Product?.ProductCategory?.id == 2
          ? parseInt(user.profit)
          : 0;

      trSale.Product.discount = discount;
    }

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
