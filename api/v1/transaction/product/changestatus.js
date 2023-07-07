const {
  AgenProduct,
  Product,
  TrSale,
  Mutation,
  User,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");

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

    const trSalse = await TrSale.findOne({
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

    if (!trSalse)
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
        [1].includes(trSalse.statusId) && // tr.stat == 1
        ![2].includes(source.statusId)) || // source.stat !== 2
      [2, 3, 5].includes(trSalse.statusId) // (canceled, rejected, delivered)
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Produk tidak dapat diubah",
      });

    /**
     * Status tidak boleh diubah delivered ketika status awal !== approved
     */
    if (trSalse.statusId !== 4 && source.statusId == 5)
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf, Data Transaksi Produk harus di Approve oleh admin terlebih dahulu",
      });

    // Status Approved
    if (source.statusId === 4 && trSalse.statusId === 1) {
      const product = await Product.findOne({
        attributes: ["id", "name", "stock"],
        where: { id: trSalse.productId },
      });

      if (!product)
        return res.status(404).json({
          status: "error",
          message: "Mohon maaf, Data Produk tidak ditemukan",
        });

      if (product.stock < trSalse.qty)
        return res.status(400).json({
          status: "error",
          message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${produk.stock} Produk`,
        });

      await product.update(
        { stock: sequelize.literal(`stock - ${trSalse.qty}`) },
        { transaction }
      );
      await trSalse.update(payload, { transaction });

      const user = await User.findOne({
        attributes: ["id", "name"],
        where: { id: trSalse.userId },
      });

      await Mutation.create(
        {
          type: "Dana Masuk",
          category: "Product",
          amount: trSalse.paidAmount,
          description: `Transaksi Produk ${product.name} dari ${
            user.name
          } sebanyak ${
            trSalse.qty
          } produk dengan total Rp.${new Intl.NumberFormat("id-ID").format(
            trSalse.amount
          )}`,
          userId: trSalse.userId,
          saleId: trSalse.id,
          remark: "",
        },
        { transaction }
      );

      // Data Produk Agen
      const agenProduct = await AgenProduct.findOne({
        where: {
          [Op.and]: [
            {
              userId: trSalse.userId,
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
            stock: trSalse.qty,
            userId: trSalse.userId,
            productId: trSalse.productId,
          },
          { transaction }
        );
      } else {
        // update stock
        await agenProduct.update(
          {
            stock: sequelize.literal(`stock + ${trSalse.qty}`),
          },
          { transaction }
        );
      }

      // proses notifikasi wa kalau transaksi di approve oleh admin

      transaction.commit();
      return res.json({
        status: "success",
        message: "Status transaksi produk berhasil di approve",
      });
    }

    await trSalse.update(payload, { transaction });
    transaction.commit();
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
