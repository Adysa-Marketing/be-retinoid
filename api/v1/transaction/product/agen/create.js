const { AgenProduct, ATrSale, Product } = require("../../../../../models");
const logger = require("../../../../../libs/logger");
const { RemoveFile } = require("./asset");
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
      name: "string|empty:false",
      qty: "string|empty:false",
      amount: "string|empty:false",
      productId: "string|empty:false",
      paymentTypeId: "string|empty:false",
      remark: "string|optional",
    };

    const RemoveImg = async (img, option) =>
      files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(img, option));
    const validate = v.compile(schema)(source);
    if (validate.length) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    // get profit
    const product = await Product.findOne({
      attributes: ["id", "name", "categoryId"],
      where: { id: source.productId },
    });

    if (!product) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data produk tidak ditemukan",
      });
    }

    const profit =
      product.categoryId == 1
        ? user.profit * 2
        : product.categoryId == 2
        ? user.profit
        : 0;

    const payload = {
      name: source.name,
      qty: source.qty,
      amount: source.amount,
      profit: profit * parseInt(source.qty),
      ...image,
      productId: source.productId,
      paymentTypeId: source.paymentTypeId,
      statusId: 1,
      userId: user.id,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const agenProduct = await AgenProduct.findOne({
      attributes: ["stock"],
      where: {
        [Op.and]: [
          {
            userId: user.id,
          },
          {
            productId: source.productId,
          },
        ],
      },
    });

    if (!agenProduct) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data produk tidak ditemukan",
      });
    }

    if (agenProduct.stock < parseInt(source.qty)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${agenProduct.stock} Produk`,
      });
    }

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
