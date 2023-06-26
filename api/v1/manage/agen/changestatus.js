const { Agen } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../models");
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  const source = req.body;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const schema = {
      id: "number|empty:false",
      status: "number|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const dateApproved =
      source.status == 4
        ? { dateApproved: moment().format("YYYY-MM-DD HH:mm:ss") }
        : {}; // ACTIVED

    const payload = {
      status: source.status,
      dateApproved,
    };

    logger.info({ source, payload });
    const agen = await Agen.findOne({
      attributes: ["id", "name", "status", "userId"],
      where: { id },
    });

    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    await agen.update(payload, { transaction });
    if (source.status == 4)
      // ACTIVED
      await User.update(
        { roleId: 3, isActive: true },
        { where: { id: agen.userId }, transaction }
      );

    /**
     * 2 == Disabled . set isActive == false
     * 3 == Rejected
     */
    if ([2, 3].includes(source.status)) {
      const isActive = source.status == 2 ? false : true;
      await User.update(
        { roleId: 2, isActive },
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
