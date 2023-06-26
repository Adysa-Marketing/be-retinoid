const { UserBank } = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const schema = {
      name: "string|empty:false",
      noRekening: "string|empty:false",
      accountName: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      userId: user.id,
      name: source.name,
      noRekening: source.noRekening,
      accountName: source.accountName,
      remark: source.remark,
    };

    logger.info({ source, payload });
    const bank = await UserBank.findOne({ where: { userId: user.id } });
    if (bank)
      return res.status(400).json({
        status: "error",
        message: "Data Bank sudah ada",
      });

    await UserBank.create(payload);

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
