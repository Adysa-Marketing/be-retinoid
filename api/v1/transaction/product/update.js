const { Product, TrSale, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
const wabot = require("../../../../libs/wabot");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      id: "string|empty:false",
      qty: "string|optional",
      amount: "string|optional",
      discount: "string|optional",
      paidAmount: "string|optional",
      fromBank: "string|optional",
      accountName: "string|optional",
      productId: "string|optional",
      paymentTypeId: "string|optional",
      bankId: "string|optional",
      address: "string|optional",
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
      productId: source.productId,
      paymentTypeId: source.paymentTypeId,
      bankId: source.bankId,
      address: source.address,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const id = source.id;
    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};
    const trSalse = await TrSale.findOne({
      attributes: ["id", "statusId"],
      where: { id, ...queryAgen },
    });

    if (!trSalse) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak ditemukan",
      });
    }

    if (![1].includes(trSalse.statusId)) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak dapat dirubah",
      });
    }

    const produk = await Product.findOne({
      attributes: ["id", "name", "stock", "amount"],
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

    RemoveImg(trSalse, true);
    await trSalse.update(payload);

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${
        userData.username
      }*, update transaksi Produk anda berhasil dengan detail : \n\n1. Nama Produk : *${
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
