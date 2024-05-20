const { ActivityLog, Agen, User } = require("../../../../models");
const db = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res, next) => {
  const transaction = await db.sequelize.transaction({ autocommit: false });
  try {
    const source = req.body;
    const userSession = req.user;

    const schema = {
      id: "number|empty:false",
      amount: "number|empty:false|min:0",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    logger.info({ source });

    const agen = await Agen.findByPk(source.id);
    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    const user = await User.findOne({
      attributes: ["id", "serialId", "username"],
      where: { id: agen.userId },
    });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    let injectWallet = parseInt(source.amount);
    await user.update(
      { wallet: Sequelize.literal(`wallet + ${injectWallet}`) },
      { transaction }
    );
    // save activity
    await ActivityLog.create(
      {
        userId: userSession.id,
        activity: `${userSession.username} melalukan Inject saldo untuk user '${
          user.username
        }' sebanyak Rp. ${new Intl.NumberFormat("id-ID").format(injectWallet)}`,
      },
      { transaction }
    );

    transaction.commit();

    return res.json({
      status: "success",
      message: `Berhasil menambahkan saldo user sebanyak Rp. ${new Intl.NumberFormat(
        "id-ID"
      ).format(injectWallet)}`,
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
