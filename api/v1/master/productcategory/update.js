const { ProductCategory } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      name: "string|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      name: source.name,
      remark: source.remark,
    };

    logger.info({ source, payload });
    const productCategory = await ProductCategory.findByPk(id);
    if (!productCategory)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Data Kategori Produk tidak ditemukan",
        });

    await productCategory.update(payload);
    return res.json({
      status: "success",
      message: "Data Kategori Produk berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
