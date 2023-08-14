const { Agen, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  const source = req.body;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const schema = {
      id: "number|empty:false",
      statusId: {
        type: "number",
        empty: false,
        enum: [1, 2, 3, 4],
      },
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;

    const agen = await Agen.findOne({
      attributes: ["id", "name", "statusId", "userId", "dateApproved"],
      where: { id },
    });

    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    const payload = {
      statusId: source.statusId,
    };
    // jika belum pernah di approve
    const dateApproved =
      source.statusId == 4
        ? moment().format("YYYY-MM-DD HH:mm:ss") 
        : null; // ACTIVED
    if (!agen.dateApproved) payload.dateApproved = dateApproved;

    logger.info({ source, payload });

    await agen.update(payload, { transaction });
    /**
     * 2 == Disabled . set isActive == false
     * 4 == Actived
     */
    if ([2, 4].includes(source.statusId)) {
      const isActive = source.statusId == 2 ? false : true;
      await User.update(
        { roleId: 3, isActive },
        { where: { id: agen.userId }, transaction }
      );
    }

    transaction.commit();
    return res.json({
      status: "success",
      message: "Status Agen berhasil diperbarui",
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
