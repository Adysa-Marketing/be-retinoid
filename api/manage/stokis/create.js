const { Stokis } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const payload = {
      name: source.name,
      price: source.price,
      discount: source.discount,
      description: source.description,
      remark: source.remark,
    };

    logger.info({ source, payload });
    await Stokis.create(payload);

    return res.status(201).json({
      status: "success",
      message: "Data Stokis berhasil dibuat",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
