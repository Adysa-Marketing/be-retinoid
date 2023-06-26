const { User, Agen, Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      stokisId: "number|empty:false",
      userId: "number|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    logger.info({ source, payload });

    const stokis = await Stokis.findByPk(source.stokisId);
    if (!stokis)
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });

    const userData = await User.findOne({
      attributes: ["id", "name"],
      where: { id: source.userId },
    });

    const payloadAgen = {
      name: userData.name,
      status: 0,
      userId: userData.id,
      stokisId: stokis.id,
      remark: source.remark,
    };

    await Agen.create(payloadAgen);

    return res.json({
      status: "success",
      message: "Data Agen berhasil dibuat",
    });
  } catch (err) {
    console.log("[!] Error : ", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
