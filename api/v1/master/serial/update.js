const { Serial } = require("../../../../models");
const logger = require("../../../../libs/logger");
const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const serial = cryptoString({ length: 10, type: "numeric" });
    const payload = {
      serialNumber: source.serialNumber ? source.serialNumber : serial,
      remark: source.remark ? source.remark : null,
    };
    logger.info({ source, payload });

    const serialNumber = await Serial.findOne({ where: { id, status: 1 } });
    if (!serialNumber) {
      return res.status(404).json({
        status: "Error",
        message: "Data serial tidak ditemukan / sudah digunakan",
      });
    }

    await serialNumber.update(payload, { where: { id } });

    return res.status(201).json({
      status: "success",
      data: "Data Serial berhasil diperbarui",
      message: "Data Serial berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
