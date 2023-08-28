const { Agen, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");
const wabot = require("../../../../libs/wabot");

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
      source.statusId == 4 ? moment().format("YYYY-MM-DD HH:mm:ss") : null; // ACTIVED
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

    const userData = await User.findOne({
      attributes: ["id", "name", "username", "phone"],
      where: { id: agen.userId },
    });

    // set custom message
    let message = "";
    const statusId = source.statusId;
    statusId == "2" // disable
      ? (message = `*[Informasi Agen] - ADYSA MARKETING*\n\nHi *${userData.username}*, akun anda sementara di disable oleh admin, untuk melakukan aktivasi dan informasi lebih lanjut harap hubungi admin \n\nTerimakasih`)
      : (message = `*[Informasi Agen] - ADYSA MARKETING*\n\nHi *${userData.username}*, akun anda sudah aktif dengan level akses sebagai Agen Stokis.`); // approved

    let waMessage = {
      to: userData.phone,
      message,
    };
    // send message
    wabot.Send(waMessage);

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
