const { AccountLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      id: "number|empty:false",
      name: "string|empty:false",
      amount: "number|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const id = source.id;
    const payload = {
      name: source.name,
      amount: source.amount,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const accountLevel = await AccountLevel.findOne({ where: { id } });
    if (!accountLevel) {
      return res.status(404).json({
        status: "error",
        message: "Data Level Akun tidak ditemukan",
      });
    }

    await accountLevel.update(payload);
    return res.status(201).json({
      status: "success",
      message: "Level Akun berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
