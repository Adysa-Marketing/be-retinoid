const { Product } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  try {
    const id = req.body.id;
    const product = await Product.findOne({ where: { id } });

    logger.info(id);
    if (!product)
      return res.status(404).json({
        status: "error",
        message: "Data Product tidak ditemukan",
      });

    await RemoveFile(product, true);
    await product.destroy();

    return res.json({
      status: "success",
      message: "Data Product berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
