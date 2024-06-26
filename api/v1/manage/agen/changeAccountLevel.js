const {
  AccountLevel,
  ActivityLog,
  Agen,
  Serial,
  User,
} = require("../../../../models");
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
      accountLevelId: "number|empty:false",
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

    const accountLevel = await AccountLevel.findByPk(source.accountLevelId);
    if (!accountLevel) {
      return res.status(404).json({
        status: "error",
        message: "Level Akun tidak ditemukan",
      });
    }

    // update level serial user
    await Serial.update(
      { accountLevelId: accountLevel.id },
      { where: { id: user.serialId }, transaction }
    );

    // update level user
    await user.update({ accountLevelId: accountLevel.id }, { transaction });

    // save activity
    await ActivityLog.create(
      {
        userId: userSession.id,
        activity: `${userSession.username} melakukan update Account Level untuk user '${user.username}' menjadi ${accountLevel.name}`,
      },
      { transaction }
    );

    transaction.commit();

    return res.json({
      status: "success",
      message: "Level Akun User berhasil diperbarui",
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
