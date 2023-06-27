const { Package } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
    const schema = {
      name: "string|empty:false",
      type: {
        type: "string",
        enum: ["Bronze", "Silver", "Gold"],
      },
      amount: "number|empty:false",
      description: "string|optional",
      remark: "string|optional"
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      type: source.type,
      amount: source.amount,
      description: source.description,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    await Package.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Paket berhasil dibuat",
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