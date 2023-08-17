const { User, Widhraw } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const wabot = require("../../../../libs/wabot");

const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.body.id;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};

    const widhraw = await Widhraw.findOne({
      attributes: ["id", "userId", "amount", "statusId", "imageKtp", "image"],
      where: { id, ...queryMember },
    });

    logger.info({ id });
    if (!widhraw)
      return res.status(404).json({
        status: "error",
        message: "Data Widhraw tidak ditemukan",
      });

    if (![1, 2, 3].includes(widhraw.statusId)) {
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Widhraw tidak dapat dihapus",
      });
    }

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });
    let messageRefund = "";

    await RemoveFile(widhraw, true);
    // jika status masih pending dan wd di hapus, kembalikan saldo
    if ([1].includes(widhraw.statusId)) {
      await User.update(
        { wallet: sequelize.literal(`wallet + ${parseInt(widhraw.amount)}`) },
        { where: { id: user.id }, transaction }
      );

      messageRefund = `dan saldo anda senilai *Rp.${new Intl.NumberFormat(
        "id-ID"
      ).format(parseInt(widhraw.amount))}* berhasil dikembalikan`;
    }
    await widhraw.destroy({ transaction });

    transaction.commit();

    wabot.Send({
      to: userData.phone,
      message: `[Transaksi Widhraw] - ADYSA MARKETING\n\nHi *${userData.username}*, Transaksi widhraw anda berhasil dihapus ${messageRefund}`,
    });
    return res.json({
      status: "success",
      message: "Data Widhraw berhasil dihapus",
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
