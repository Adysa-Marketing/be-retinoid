const { User, Testimonial } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      keyword: "string|optional",
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
                  Sequelize.fn("lower", Sequelize.col("User.name")),
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

    const where = {
      ...keyword,
    };
    const includeParent = [
      {
        attributes: ["id", "name", "username", "email", "phone"],
        model: User,
        where,
      },
    ];

    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Testimonial.count({
      include: [...includeParent],
    });

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

    const testimoni = await Testimonial.findAll({
      ...offsetLimit,
      attributes: ["id", "rating", "testimonial"],
      include: [...includeParent],
    });

    return res.json({
      status: "success",
      data: testimoni,
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
