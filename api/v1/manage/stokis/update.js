const { Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      price: "number|optional",
      discount: "number|optional",
      description: "string|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const payload = {
      name: source.name,
      price: source.price,
      discount: source.discount,
      description: source.description,
      remark: source.remark,
    };

    logger.info({ source, payload });
    const stokis = await Stokis.findOne({ where: { id } });

    if (!stokis)
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });

    await stokis.update(payload);

    return res.json({
      status: "success",
      message: "Data Stokis berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
