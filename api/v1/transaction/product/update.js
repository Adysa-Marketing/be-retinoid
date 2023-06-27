const { Product, TrSale } = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      id: "number|empty:false",
      qty: "number|optional",
      amount: "number|optional",
      fromBank: "string|optional",
      accountName: "string|optional",
      date: "optional",
      productId: "number|optional",
      paymentTypeId: "number|optional",
      userId: "number|optional",
      bankId: "number|optional",
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
      fromBank: source.fromBank,
      accountName: source.accountName,
      date: source.date,
      productId: source.productId,
      paymentTypeId: source.paymentTypeId,
      userId: source.userId ? source.userId : user.id,
      bankId: source.bankId,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const id = source.id;
    const trSalse = await TrSale.findOne({
      attributes: ["id", "statusId"],
      where: { id },
    });

    if (!trSalse)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak ditemukan",
      });

    if (![1].includes(trSalse.status))
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak dapat dirubah",
      });

    const produk = await Product.findOne({
      attributes: ["id", "name", "stock"],
      where: { id: source.productId },
    });
    if (!produk)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data produk tidak ditemukan",
      });

    if (produk.stock < source.qty)
      return res.status(400).json({
        status: "error",
        message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${produk.stock} Produk`,
      });

    files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(trSalse, true));

    await trSalse.update(payload);
    return res.json({
      status: "success",
      message:
        "Data transaksi produk berhasil diperbarui, silahkan menunggu admin untuk melakukan pengecekan",
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
