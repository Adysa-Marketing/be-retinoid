const { Bank } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      noRekening: "string|optional",
      accountName: "string|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      name: source.name,
      noRekening: source.noRekening,
      accountName: source.accountName,
      remark: source.remark,
    };

    const id = source.id;
    logger.info({ source, payload });
    const bank = await Bank.findByPk(id);
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
