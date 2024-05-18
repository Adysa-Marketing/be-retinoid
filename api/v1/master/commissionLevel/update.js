const { AccountLevel, CommissionLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      name: "string|empty:false",
      percent: "number|empty:false|min:1",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    // cek existing data
    let commissionLevel = await CommissionLevel.findOne({
      where: { id: source.id },
    });

    if (!commissionLevel) {
      return res.status(404).json({
        status: "error",
        message: "Data Level komisi tidak ditemukan",
      });
    }

    // data yg boleh di update hanya nama dan persen saja
    const payload = {
      name: source.name,
      percent: source.percent,
      remark: source.remark,
    };

    logger.info({ source, payload });

    commissionLevel.update(payload);
    return res.status(201).json({
      status: "success",
      message: "Level Komisi berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
