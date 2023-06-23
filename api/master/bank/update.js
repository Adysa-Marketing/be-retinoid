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
    const bank = await Bank.findOne({ where: { id: source.id } });
    if (!bank)
      return res
        .status(404)
        .json({ status: "error", message: "Data Bank tidak ditemukan" });

    await bank.update(payload);
    return res.json({
      status: "success",
      message: "Data Bank berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
