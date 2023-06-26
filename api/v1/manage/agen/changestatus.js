const { Agen } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  const source = req.body;
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
      source.status == 1
        ? { dateApproved: moment().format("YYYY-MM-DD HH:mm:ss") }
        : {};

    const payload = {
      status: source.status,
      dateApproved,
    };

    logger.info({ source, payload });
    const agen = await Agen.findOne({
      attributes: ["id", "name", "status"],
      where: { id },
    });
    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    await agen.update(payload);
    return res.json({
      status: "success",
      message: "Status Agen berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
