const { Product, ProductCategory } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  try {
    const schema = {
      id: "string|empty:false",
      name: "string|optional",
      categoryId: "string|optional",
      amount: "string|optional",
      stock: "string|optional",
      description: "string|optional",
    };

    const RemoveImg = async (img, option) =>
      files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(img, option));

    const validate = v.compile(schema)(source);
    if (validate.length) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const id = source.id;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      categoryId: source.categoryId,
      amount: source.amount,
      description: source.description,
      stock: source.stock,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const product = await Product.findOne({ where: { id } });
    if (!product) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Product tidak ditemukan",
      });
    }

    if (source.categoryId) {
      const productCategory = await ProductCategory.findByPk(source.categoryId);
      if (!productCategory) {
        RemoveImg(files, false);
        return res.status(500).json({
          status: "error",
          message: "Category produk tidak ditemukan",
        });
      }
    }

    RemoveImg(product, true);
    await product.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Product berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
