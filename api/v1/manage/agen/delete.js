const { Agen, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../models");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
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
    const agen = await Agen.findByPk(id);

    logger.info(id);
    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    await User.update(
      { roleId: 4, isActive: true },
      { where: { id: agen.userId }, transaction }
    );
    await agen.destroy({ transaction });

    transaction.commit()
    return res.json({
      status: "success",
      message: "Data Agen berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    transaction.rollback()
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
