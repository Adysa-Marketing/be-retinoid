const { Package } = require("../../../../models");
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
      type: {
        type: "string",
        enum: ["Bronze", "Silver", "Gold"],
        optional: true,
      },
      amount: "string|optional",
      description: "string|optional",
      remark: "string|optional",
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
      type: source.type,
      amount: source.amount,
      description: source.description,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const package = await Package.findOne({ where: { id } });
    if (!package) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Paket tidak ditemukan",
      });
    }

    RemoveImg(package, true);
    await package.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Paket berhasil diperbarui",
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
