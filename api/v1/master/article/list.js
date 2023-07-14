const { Article } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const source = req.body;

    const schema = {
      keyword: "string|optional",
      statusId: "number|optional",
      type: "string|optional",
      rowsPerPage: [
        { type: "string", empty: "false" },
        { type: "number", empty: "false" },
      ],
      currentPage: "number|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id =
      source.keyword?.length > 3
        ? source.keyword.substr(3, source.keyword.length - 1)
        : 0;
    const keycode = !isNaN(id) ? { id } : {};

    const keyword = source.keyword
      ? {
          [Op.or]: [
            {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn("lower", Sequelize.col("Article.title")),
                  Op.like,
                  "%" + source.keyword.toString().toLowerCase() + "%"
                ),
              ],
            },
            {
              id: !isNaN(source.keyword) ? parseInt(source.keyword) : 0,
            },
            {
              ...keycode,
            },
          ],
        }
      : {};

    const queryType = source.type !== "All" ? { isActive: true } : {};
    const queryStatus = source.statusId
      ? source.statusId == 1
        ? { isActive: true }
        : { isActive: false }
      : {};
    const where = {
      ...keyword,
      ...queryType,
      ...queryStatus,
    };

    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Article.count({ where });

    const totalPages =
      rowsPerPage !== "All"
        ? totalData
          ? totalData % rowsPerPage === 0
            ? parseInt(totalData / rowsPerPage)
            : parseInt(totalData / rowsPerPage) + 1
          : 0
        : 1;
    const offset = rowsPerPage !== "All" ? (currentPage - 1) * rowsPerPage : 0;
    const limit = rowsPerPage !== "All" ? rowsPerPage : totalData;
    const offsetLimit = rowsPerPage !== "All" ? { offset, limit } : {};

    const data = await Article.findAll({
      ...offsetLimit,
      attributes: [
        "id",
        "title",
        "slug",
        "image",
        "author",
        "view",
        "excerpt",
        "isActive",
      ],
      where,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: "success",
      data,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
