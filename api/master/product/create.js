const { Product } = require("../../../models");
const logger = require("../../../libs/logger");
const { RemoveFile } = require("./asset");

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
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

    await Product.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Product berhasil dibuat",
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
