const { User, Widhraw } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");

const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  const files = req.files;

  try {
    const schema = {
      id: "number|empty:false",
      statusId: "number|empty:false",
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

    // bukti transfer apabila status transfered oleh admin
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    logger.info({ source, payload });

    const widhraw = await Widhraw.findOne({
      attributes: ["id", "userId", "amount", "statusId"],
      where: { id, ...queryMember },
    });

    if (!widhraw)
      return res.status(404).json({
        status: "error",
        message: "Data Widhraw tidak ditemukan",
      });

    /**
     * jika widhraw.statusId == Canceled / Rejected / Transfered
     */
    if ([2, 3, 5].includes(widhraw.statusId))
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, status widhraw sudah tidak dapat dirubah",
      });

    /**
     * user hanya bisa ubah status dari pending ke cancel
     */
    if (
      [4].includes(user.roleId) && //role user
      ![1].includes(widhraw.statusId) && // status != pending
      ![2].includes(source.statusId) // status != canceled
    )
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, anda tidak memiliki akses untuk merubah status",
      });

    /**
     * jika status canceled / rejected oleh admin
     * update wallet user
     */
    if ([2, 4].includes(source.statusId)) {
      const userData = await User.findByPk(widhraw.userId);
      if (!userData)
        return res.status(404).json({
          status: "error",
          message: "Data User tidak ditemukan",
        });

      await userData.update(
        {
          wallet: sequelize.col("wallet") + widhraw.amount,
        },
        { transaction }
      );
    }

    await widhraw.update({ ...payload, ...image }, { transaction });

    transaction.commit();
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
