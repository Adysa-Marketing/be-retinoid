const {
  Product,
  TrSale,
  User,
  ProductCategory,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
const wabot = require("../../../../libs/wabot");

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
      address: "string|empty:false",
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

    if (![3].includes(user.roleId)) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf anda tidak dapat melakukan transaksi ini",
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
      address: source.address,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const produk = await Product.findOne({
      attributes: ["id", "name", "stock", "amount"],
      where: { id: source.productId },
      include: {
        attributes: ["id", "name"],
        model: ProductCategory,
      },
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

    let discount = 0;
    // jika product category == bundle product. cek diskon
    if (
      [1, 2].includes(produk.ProductCategory.id) &&
      [3].includes(user.roleId)
    ) {
      const categoryId = produk.ProductCategory.id;
      const productPrice = parseInt(produk.amount);

      if (categoryId == 1) {
        //bundle package bronze
        if (productPrice >= 500000 && productPrice <= 1000000)
          discount = parseInt(user.profit) * 2;

        //bundle package silver
        if (productPrice >= 1500000 && productPrice <= 2000000)
          discount = parseInt(user.profit) * 6;

        //bundle package gold
        if (productPrice >= 2500000 && productPrice <= 3000000)
          discount = parseInt(user.profit) * 10;
      } else if (categoryId == 2) {
        discount = parseInt(user.profit); // bundle product
      }
    }

    discount = parseInt(discount) * parseInt(source.qty);

    // jika diskon tidak sesuai
    if (discount !== parseInt(source.discount)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: `Transaksi gagal, Total diskon tidak sesuai`,
      });
    }

    await TrSale.create(payload);

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${
        userData.username
      }*, pengajuan transaksi Produk anda berhasil dengan detail : \n\n1. Nama Produk : *${
        produk.name
      }* \n2. Harga Satuan :  *Rp.${new Intl.NumberFormat("id-ID").format(
        produk.amount
      )}* \n3. Jumlah : *${
        source.qty
      }* \n4. Harga Total : *Rp.${new Intl.NumberFormat("id-ID").format(
        source.amount
      )}* \n5. Diskon Agen : *Rp.${new Intl.NumberFormat("id-ID").format(
        source.discount
      )}* \n6. Total Bayar : *Rp.${new Intl.NumberFormat("id-ID").format(
        source.paidAmount
      )}* \n\nData yang anda ajukan akan segera di proses oleh admin, mohon kesediaan-nya untuk menunggu. \n\nTerimakasih`,
    });

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
