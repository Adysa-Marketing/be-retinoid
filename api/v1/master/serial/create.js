const { Serial } = require("../../../../models");
const logger = require("../../../../libs/logger");
const cryptoString = require("crypto-random-string");

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const serial = cryptoString({ length: 10, type: "numeric" });
    const payload = {
      serialNumber: source.serialNumber ? source.serialNumber : serial,
      status: 1,
      remark: source.remark ? source.remark : null,
    };
    logger.info({ source, payload });

    await Serial.create(payload);
    return res.status(201).json({
      status: "success",
      data: "Data Serial berhasil dibuat",
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
