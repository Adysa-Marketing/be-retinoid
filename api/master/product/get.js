const { Product } = require("../../../models");
const logger = require("../../../libs");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ where: { id } });

    logger.info(id);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Data Produk tidak ditemukan" });

    return res.json({
      status: "success",
      data: product,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
