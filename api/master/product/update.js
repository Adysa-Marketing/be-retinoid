const { Product } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      type: "string|optional",
      amount: "number|optional",
      description: "string|optional",
      stock: "number|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      type: source.type,
      amount: source.amount,
      description: source.description,
      stock: source.stock,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const product = await Product.findOne({ id });
    if (!product)
      return res.status(404).json({
        status: "error",
        message: "Data Product tidak ditemukan",
      });

    files && files.image && (await RemoveFile(product, true));
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
