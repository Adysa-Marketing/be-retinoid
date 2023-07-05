const { Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      name: "string|empty:false",
      price: "number|empty:false|min:1",
      discount: "number|empty:false|min:1",
      agenDiscount: "number|empty:false|min:1",
      description: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      name: source.name,
      price: source.price,
      discount: source.discount,
      agenDiscount: source.agenDiscount,
      description: source.description,
      remark: source.remark,
    };

    logger.info({ source, payload });
    await Stokis.create(payload);

    return res.status(201).json({
      status: "success",
      data: "Data Stokis berhasil dibuat",
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
