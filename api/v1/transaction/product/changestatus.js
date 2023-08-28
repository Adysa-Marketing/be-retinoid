const {
  AgenProduct,
  Product,
  TrSale,
  Mutation,
  User,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const wabot = require("../../../../libs/wabot");

const sequelize = require("sequelize");
const Op = sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const schema = {
      id: "number|empty:false",
      statusId: {
        type: "number",
        empty: false,
        enum: [1, 2, 3, 4, 5],
      },
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      statusId: source.statusId,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const id = source.id;
    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};

    const trSale = await TrSale.findOne({
      attributes: [
        "id",
        "statusId",
        "productId",
        "qty",
        "userId",
        "amount",
        "discount",
        "paidAmount",
      ],
      where: { id, ...queryAgen },
    });

    if (!trSale)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak ditemukan",
      });

    /**
     * Jika login sbg member dan status tr !== 1 (pending) dan source.status !== 2 (canceled)
     * Tr tidak dapat dirubah ketika status awal nya (canceled, rejected, delivered)
     */
    if (
      ([3].includes(user.roleId) && //agen
        [1].includes(trSale.statusId) && // tr.stat == 1
        ![2].includes(source.statusId)) || // source.stat !== 2
      [2, 3, 5].includes(trSale.statusId) // (canceled, rejected, delivered)
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Produk tidak dapat diubah",
      });

    /**
     * Status tidak boleh diubah delivered ketika status awal !== approved
     */
    if (trSale.statusId !== 4 && source.statusId == 5)
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf, Data Transaksi Produk harus di Approve oleh admin terlebih dahulu",
      });

    // Status Approved
    if (source.statusId === 4 && trSale.statusId === 1) {
      const product = await Product.findOne({
        attributes: ["id", "name", "stock"],
        where: { id: trSale.productId },
      });

      if (!product)
        return res.status(404).json({
          status: "error",
          message: "Mohon maaf, Data Produk tidak ditemukan",
        });

      if (product.stock < trSale.qty)
        return res.status(400).json({
          status: "error",
          message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${produk.stock} Produk`,
        });

      await product.update(
        { stock: sequelize.literal(`stock - ${trSale.qty}`) },
        { transaction }
      );
      await trSale.update(payload, { transaction });

      const user = await User.findOne({
        attributes: ["id", "name"],
        where: { id: trSale.userId },
      });

      await Mutation.create(
        {
          type: "Dana Masuk",
          category: "Product",
          amount: trSale.paidAmount,
          description: `Transaksi Produk ${product.name} dari ${
            user.name
          } sebanyak ${
            trSale.qty
          } produk dengan total Rp.${new Intl.NumberFormat("id-ID").format(
            trSale.amount
          )}`,
          userId: trSale.userId,
          saleId: trSale.id,
          remark: "",
        },
        { transaction }
      );

      // Data Produk Agen
      const agenProduct = await AgenProduct.findOne({
        where: {
          [Op.and]: [
            {
              userId: trSale.userId,
            },
            {
              productId: product.id,
            },
          ],
        },
      });

      if (!agenProduct) {
        await AgenProduct.create(
          {
            stock: trSale.qty,
            userId: trSale.userId,
            productId: trSale.productId,
          },
          { transaction }
        );
      } else {
        // update stock
        await agenProduct.update(
          {
            stock: sequelize.literal(`stock + ${trSale.qty}`),
          },
          { transaction }
        );
      }
      const userData = await User.findOne({
        attributes: ["id", "name", "username", "phone"],
        where: { id: trSale.userId },
      });

      transaction.commit();
      // proses notifikasi wa kalau transaksi di approve oleh admin

      wabot.Send({
        to: userData.phone,
        message: `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi reward anda sudah di approve oleh admin. silahkan menunggu beberapa saat untuk informasi resi pengiriman.`,
      });

      return res.json({
        status: "success",
        message: "Status transaksi produk berhasil di approve",
      });
    }

    const userData = await User.findOne({
      attributes: ["id", "name", "username", "phone"],
      where: { id: trSale.userId },
    });

    await trSale.update(payload, { transaction });
    transaction.commit();

    let message = "";
    const statusId = source.statusId;
    statusId == "2" // cancel
      ? (message = `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi Produk anda berhasil dibatalkan.`)
      : statusId == "3" // reject
      ? (message = `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Mohon maaf transaksi produk anda ditolak oleh admin dengan alasan ${source.remark}.`)
      : statusId == "4" // approved
      ? (message = `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi Produk anda sudah di approve oleh admin. silahkan menunggu beberapa saat untuk informasi resi pengiriman`)
      : (message = `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Selamat Produk yang anda pesan sudah dalam proses pengiriman dengan detail resi [ *${source.remark}* ]`); // delivered

    // send message
    wabot.Send({
      to: userData.phone,
      message,
    });

    return res.json({
      status: "success",
      message: "Data transaksi produk berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
