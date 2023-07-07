const { TrStokis, Stokis, Mutation, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");

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

    const id = source.id;
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    const trStokis = await TrStokis.findOne({
      attributes: ["id", "userId", "stokisId", "statusId", "amount"],
      where: {
        id,
        ...queryMember,
      },
    });

    if (!trStokis)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Stokis tidak ditemukan",
      });

    if (
      [4].includes(user.roleId) && // member
      [1].includes(trStokis.statusId) && // Pending
      ![2].includes(source.statusId) // status 2 == canceled
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Anda tidak diizinkana mengubah status data ini!",
      });

    /**
     * jika trStokis.statusId == Canceled / Rejected
     */
    if ([2, 3, 4].includes(trStokis.statusId)) {
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, status transaksi sudah tidak dapat dirubah",
      });
    }

    if ([4].includes(source.statusId)) {
      const stokis = await Stokis.findOne({
        attributes: ["id", "name", "price"],
        where: { id: trStokis.stokisId },
      });

      if (!stokis)
        return res.status(404).json({
          status: "error",
          message: "Data Stokis tidak ditemukan",
        });

      const user = await User.findOne({
        attributes: ["id", "name"],
        where: { id: trStokis.userId },
      });

      const mutation = await Mutation.create(
        {
          type: "Dana Masuk",
          category: "Stokis",
          amount: trStokis.amount,
          description: `Pendaftaran ${stokis.name} oleh member ${
            user.name
          } dengan total Rp.${new Intl.NumberFormat("id-ID").format(
            trStokis.amount
          )}`,
          userId: trStokis.userId,
          trStokisId: trStokis.id,
          remark: "",
        },
        { transaction }
      );
    }

    await trStokis.update(payload, { transaction });
    transaction.commit();
    logger.info({ source, payload });
    return res.json({
      status: "success",
      message: "Status Transaksi Stokis berhasil diubah",
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
