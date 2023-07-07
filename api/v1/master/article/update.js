const { Article } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const slugify = require("slugify");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  try {
    const schema = {
      id: "string|empty:false",
      title: "string|optional",
      isActive: "string|optional",
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

    const slug = slugify(source.title, {
      replacement: "-",
      lower: true,
    });

    const isActive = source.isActive
      ? source.isActive == "true"
        ? { isActive: true }
        : { isActive: false }
      : {};
    const payload = {
      title: source.title,
      slug,
      ...isActive,
      description: source.description,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const atricle = await Article.findOne({ where: { id } });
    if (!atricle) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Artikel tidak ditemukan",
      });
    }

    RemoveImg(atricle, true);
    await atricle.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Artikel berhasil diperbarui",
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
