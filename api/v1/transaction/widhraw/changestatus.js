const { User, Widhraw, Mutation } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const wabot = require("../../../../libs/wabot");

const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  const files = req.files;
  let waMessage = {
    to: null,
    message: null,
  };

  try {
    const schema = {
      id: "string|empty:false",
      statusId: {
        type: "string",
        empty: false,
        enum: ["1", "2", "3", "4", "5"],
      },
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

    const payload = {
      statusId: parseInt(source.statusId),
      remark: source.remark,
    };

    const id = source.id;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};

    // bukti transfer apabila status transfered oleh admin
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    logger.info({ source, payload });

    const widhraw = await Widhraw.findOne({
      attributes: [
        "id",
        "userId",
        "amount",
        "paidAmount",
        "statusId",
        "image",
        "remark",
      ],
      where: { id, ...queryMember },
    });

    if (!widhraw) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Widhraw tidak ditemukan",
      });
    }

    const userData = await User.findOne({
      attributes: ["id", "name", "username", "phone"],
      where: { id: widhraw.userId },
    });

    /**
     * jika widhraw.statusId == Canceled / Rejected / Transfered
     */
    if ([2, 3, 5].includes(widhraw.statusId)) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, status widhraw sudah tidak dapat dirubah",
      });
    }

    /**
     * user hanya bisa ubah status dari pending ke cancel
     */
    if (
      [3, 4].includes(user.roleId) && //role user
      [1].includes(widhraw.statusId) && // status != pending
      ![2].includes(parseInt(source.statusId)) // status != canceled
    ) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, anda tidak memiliki akses untuk merubah status",
      });
    }

    /**
     * jika status canceled oleh member
     * jika status canceled / rejected oleh admin
     * update wallet user
     */
    if ([2, 3].includes(parseInt(source.statusId))) {
      if (!userData) {
        RemoveImg(files, false);
        return res.status(404).json({
          status: "error",
          message: "Data User tidak ditemukan",
        });
      }

      await userData.update(
        {
          wallet: sequelize.literal(`wallet + ${parseInt(widhraw.amount)}`),
        },
        { transaction }
      );
    }

    RemoveImg(widhraw, true);
    await widhraw.update({ ...payload, ...image }, { transaction });

    // transfered
    if (parseInt(source.statusId) == 5) {
      await Mutation.create(
        {
          type: "Dana Keluar",
          category: "Widhraw",
          amount: widhraw.paidAmount,
          description: `Pembayaran widhraw kepada ${
            userData.name
          } senilai Rp.${new Intl.NumberFormat("id-ID").format(
            widhraw.paidAmount
          )}`,
          userId: userData.id,
          widhrawId: widhraw.id,
          remark: "",
        },
        { transaction }
      );
    }
    transaction.commit();

    // set custom message
    let message = "";
    const statusId = source.statusId;
    statusId == "2" // cancel
      ? (message = `*[Transaksi Widhraw] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi widhraw anda berhasil dibatalkan dan saldo anda berhasil dikembalikan`)
      : statusId == "3" // reject
      ? (message = `*[Transaksi Widhraw] - ADYSA MARKETING*\n\nHi *${userData.username}*, Mohon maaf transaksi widhraw anda ditolak oleh admin dengan alasan ${source.remark} dan saldo anda berhasil dikembalikan!`)
      : statusId == "4" // approved
      ? (message = `*[Transaksi Widhraw] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi widhraw anda sudah di approve oleh admin. silahkan menunggu beberapa saat untuk proses transfer`)
      : (message = `*[Transaksi Widhraw] - ADYSA MARKETING*\n\nHi *${
          userData.username
        }*, Selamat widhraw anda sudah di transfer oleh admin dengan nominal approve *Rp.${new Intl.NumberFormat(
          "id-ID"
        ).format(widhraw.paidAmount)}*`); // transfered

    waMessage = {
      to: userData.phone,
      message,
    };
    // send message
    wabot.Send(waMessage);

    return res.json({
      status: "success",
      message: "Status Widhraw berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
