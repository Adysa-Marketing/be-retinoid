const { TrReward, User } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const wabot = require("../../../../libs/wabot");

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
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    const trReward = await TrReward.findOne({
      where: { id, ...queryMember },
    });

    logger.info({ id });
    if (!trReward)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Reward tidak ditemukan",
      });

    if (![1, 2, 3].includes(trReward.statusId))
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward tidak dapat dihapus",
      });

    await RemoveFile(trReward, true);
    await trReward.destroy({ transaction });

    transaction.commit();

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Reward] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi reward anda berhasil dihapus.`,
    });
    return res.json({
      status: "success",
      message: "Data Transaksi Reward berhasil dihapus",
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
