const { AgenProduct, ATrSale } = require("../../../../../models");
const logger = require("../../../../../libs/logger");

const sequelize = require("sequelize");
const Op = sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      qty: "number|empty:false",
      amount: "number|empty:false",
      productId: "number|empty:false",
      paymentTypeId: "number|empty:false",
      userId: "number|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      qty: source.qty,
      amount: source.amount,
      ...image,
      productId: source.productId,
      paymentTypeId: source.paymentTypeId,
      statusId: 1,
      userId: source.userId ? source.userId : user.id,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const agenProduct = await AgenProduct.findOne({
      attributes: ["id", "stock"],
      where: {
        [Op.and]: [
          {
            userId: source.userId ? source.userId : user.id,
          },
          {
            productId: source.productId,
          },
        ],
      },
    });
    if (!agenProduct)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data produk tidak ditemukan",
      });

    if (agenProduct.stock < source.qty)
      return res.status(400).json({
        status: "error",
        message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${agenProduct.stock} Produk`,
      });

    await ATrSale.create(payload);
    return res.status(201).json({
      status: "success",
      message:
        "Permintaan anda berhasil diproses, silahkan lakukan approve transaksi",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
