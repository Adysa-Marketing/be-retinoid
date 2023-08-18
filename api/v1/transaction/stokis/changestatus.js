const { TrStokis, Stokis, Mutation, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const wabot = require("../../../../libs/wabot");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  let waMessage = {
    to: null,
    message: null,
  };

  try {
    const schema = {
      id: "number|empty:false",
      statusId: {
        type: "number",
        empty: false,
        enum: [1, 2, 3, 4],
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

      await Mutation.create(
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

    const userData = await User.findOne({
      attributes: ["id", "name", "username", "phone"],
      where: { id: trStokis.userId },
    });

    await trStokis.update(payload, { transaction });
    transaction.commit();

    // set custom message
    let message = "";
    const statusId = source.statusId;
    statusId == "2" // cancel
      ? (message = `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi stokis anda berhasil dibatalkan. apabila anda telah melakukan transfer pembayaran, harap menghubungi admin untuk melakukan pengembalian pembayaran dengan menyertakan data diri dan bukti transfer yang telah dilakukan. \n\nTerimakasih`)
      : statusId == "3" // reject
      ? (message = `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${userData.username}*, Mohon maaf transaksi stokis anda ditolak oleh admin dengan alasan ${source.remark}. apabila anda telah melakukan transfer pembayaran, harap menghubungi admin untuk melakukan pengembalian pembayaran dengan menyertakan data diri dan bukti transfer yang telah dilakukan. \n\nTerimakasih`)
      : (message = `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi stokis anda sudah di approve oleh admin. akses akun anda akan segera di upgrade sebagai AGEN, mohon tunggu beberapa saat.\n\nTerimakasih`); // approved

    waMessage = {
      to: userData.phone,
      message,
    };
    // send message
    wabot.Send(waMessage);

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
