const { Bank } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const source = req.body;

    const payload = {
      name: source.name,
      noRekening: source.noRekening,
      accountName: source.accountName,
      remark: source.remark,
    };

    logger.info({ source, payload });
    await Bank.create(payload);

    return res.status(201).json({
      status: "success",
      message: "Data Bank berhasil dibuat",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
