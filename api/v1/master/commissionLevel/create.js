const { AccountLevel, CommissionLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      name: "string|empty:false",
      percent: "number|empty:false|min:1",
      level: "number|empty:false",
      accountLevelId: "number|emtpy:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    // cek account level
    const accountLevel = await AccountLevel.findOne({
      attributes: ["id", "name"],
      where: { id: source.accountLevelId },
    });
    if (!accountLevel) {
      return res
        .status(400)
        .json({ status: "error", message: "Level Akun tidak ditemukan" });
    }

    // cek existing commissin with level and account level exist
    // tidak boleh ada commission level yg duplicate
    let existingLevel = await CommissionLevel.findOne({
      where: { level: source.level, accountLevelId: accountLevel.id },
    });
    if (existingLevel) {
      return res.status(400).json({
        status: "error",
        message: `Data Level Komisi dengan kedalaman level '${source.level}' untuk Akun Level ${accountLevel.name} sudah tersedia`,
      });
    }

    const payload = {
      name: source.name,
      percent: source.percent,
      level: source.level,
      accountLevelId: source.accountLevelId,
      remark: source.remark,
    };

    logger.info({ source, payload });

    await CommissionLevel.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Level Komisi berhasil dibuat",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
