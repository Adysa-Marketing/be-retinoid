const { Article } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const slugify = require("slugify");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;
  try {
    const schema = {
      title: "string|empty:false",
      isActive: "string|empty:false",
      description: "string|empty:false",
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

    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const slug = slugify(source.title, {
      replacement: "-",
      lower: true,
    });

    const payload = {
      title: source.title,
      slug,
      author: user.name,
      isActive: source.isActive == "true" ? true : false,
      description: source.description,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    await Article.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Artikel berhasil dibuat",
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
