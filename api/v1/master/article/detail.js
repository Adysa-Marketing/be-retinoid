const { Article } = require("../../../../models");
const logger = require("../../../../libs/logger");
const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      slug: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const slug = req.params.slug;
    const article = await Article.findOne({
      attributes: [
        "id",
        "title",
        "image",
        "slug",
        "author",
        "isActive",
        "view",
        "description",
        "remark",
      ],
      where: { slug },
    });

    logger.info({ slug });
    if (!article)
      return res.status(404).json({
        status: "error",
        message: "Data Artikel tidak ditemukan",
      });

    await article.update({ view: sequelize.literal(`view + 1`) });

    return res.json({
      status: "success",
      data: article,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
