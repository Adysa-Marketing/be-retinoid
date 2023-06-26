const { ProductCategory } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.body.id;
    const productCategory = await ProductCategory.findByPk(id);

    logger.info(id);

    if (!productCategory)
      return res.status(404).json({
        status: "error",
        message: "Data Kategori Produk tidak ditemukan",
      });

    await productCategory.destroy();
    return res.json({
      status: "success",
      message: "Data Kategori Produk berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
