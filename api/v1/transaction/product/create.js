const { Product, TrSale } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");

const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      qty: "string|empty:false",
      amount: "string|empty:false|min:1",
      discount: "string|empty:false|min:1",
      paidAmount: "string|empty:false|min:1",
      fromBank: "string|empty:false",
      accountName: "string|empty:false",
      productId: "string|empty:false",
      paymentTypeId: "string|empty:false",
      userId: "string|optional",
      bankId: "string|optional",
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

    const payload = {
      qty: source.qty,
      amount: source.amount,
      discount: source.discount,
      paidAmount: source.paidAmount,
      ...image,
      fromBank: source.fromBank,
      accountName: source.accountName,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      productId: source.productId,
      paymentTypeId: source.paymentTypeId,
      statusId: 1,
      userId: source.userId ? source.userId : user.id,
      bankId: source.bankId ? source.bankId : null,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const produk = await Product.findOne({
      attributes: ["id", "name", "stock"],
      where: { id: source.productId },
    });
    if (!produk) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data produk tidak ditemukan",
      });
    }

    if (produk.stock < parseInt(source.qty)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${produk.stock} Produk`,
      });
    }

    await TrSale.create(payload);
    return res.status(201).json({
      status: "success",
      message:
        "Permintaan anda berhasil diproses, silahkan menunggu admin untuk melakukan pengecekan",
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
