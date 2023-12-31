const { ProductCategory } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const productCategory = await ProductCategory.findByPk(id);

    logger.info({ id });
    if (!productCategory)
      return res.status(404).json({
        status: "error",
        message: "Data Kategori Produk tidak ditemukan",
      });

    return res.json({ status: "success", data: productCategory });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
