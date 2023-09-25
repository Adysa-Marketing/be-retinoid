const { Article } = require("../../../../models");
const logger = require("../../../../libs/logger");
const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      slug: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const slug = source.slug;
    const checkArticle = await Article.findOne({
      attributes: ["id"],
      where: { slug },
    });

    logger.info({ slug });
    if (!checkArticle)
      return res.status(404).json({
        status: "error",
        message: "Data Artikel tidak ditemukan",
      });

    await Article.update(
      { view: sequelize.literal(`view + 1`) },
      { where: { id: checkArticle.id } }
    );

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
        "excerpt",
        "remark",
      ],
      where: { slug },
    });

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
