const { UserBank } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const schema = {
      name: "string|optional",
      noRekening: "string|optional",
      accountName: "string|optional",
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

    logger.info({ source, payload });
    const bank = await UserBank.findOne({ where: { userId: user.id } });
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
