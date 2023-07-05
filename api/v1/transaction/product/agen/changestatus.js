const { AgenProduct, ATrSale } = require("../../../../../models");
const logger = require("../../../../../libs/logger");
const db = require("../../../../../models");

const sequelize = require("sequelize");
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

    const aTrSalse = await ATrSale.findOne({
      attributes: ["id", "statusId", "qty", "productId"],
      where: { id, ...queryAgen },
    });

    if (!aTrSalse)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf data transaksi produk tidak ditemukan",
      });

    /**
     *
     * Tr tidak dapat dirubah ketika status awal nya (canceled, rejected, delivered)
     */
    if (
      [2, 3, 5].includes(aTrSalse.statusId) // (canceled, rejected, delivered)
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Produk tidak dapat diubah",
      });

    /**
     * Status tidak boleh diubah delivered ketika status awal !== approved
     */
    if (aTrSalse.statusId !== 4 && source.statusId == 5)
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf, Data Transaksi Produk harus di Approve terlebih dahulu",
      });

    // Status Approved
    if (source.statusId === 4) {
      const agenProduct = await AgenProduct.findOne({
        attributes: ["stock"],
        where: { productId: aTrSalse.productId, userId: user.id },
      });
      if (!agenProduct)
        return res.status(400).json({
          status: "error",
          message: "Mohon maaf, Data Produk tidak ditemukan",
        });

      if (agenProduct.stock < aTrSalse.qty)
        return res.status(400).json({
          status: "error",
          message: `Transaksi gagal, Mohon maaf jumlah pembelian melebihi stok yang tersedia. Stok tersedia saat ini adalah ${agenProduct.stock} Produk`,
        });

      await AgenProduct.update(
        { stock: sequelize.literal(`stock - ${aTrSalse.qty}`) },
        {
          where: { productId: aTrSalse.productId, userId: user.id },
          transaction,
        }
      );
      await aTrSalse.update(payload, { transaction });

      transaction.commit();
      return res.json({
        status: "success",
        message: "Data transaksi produk berhasil di approve",
      });
    }

    await aTrSalse.update(payload, { transaction });
    transaction.commit();
    return res.json({
      status: "success",
      message: "Status transaksi produk berhasil diperbarui",
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
