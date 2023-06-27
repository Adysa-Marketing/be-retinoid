const { User, Generation, CommissionLevel } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;
    const id =
      source.keyword.length > 3
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
                  "%" + source.keycode.toString().toLowerCase() + "%"
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

    logger.info(source);
    const queryLevel = req.query.level ? { levelId: req.query.level } : {};

    const includeParent = [
      {
        attributes: ["id", "name", "email", "phone", "isActive"],
        as: "Downline",
        model: User,
        where: {
          ...keyword,
        },
      },
      {
        attributes: ["id", "name", "percent"],
        model: CommissionLevel,
      },
    ];

    const where = {
      userId: user.id,
      ...queryLevel,
    };

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Generation.count({
      where,
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

    Generation.findAll({
      ...offsetLimit,
      where,
      include: [...includeParent],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((gen) => {
          gen.createdAt = moment(gen.createdAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return gen;
        });

        return res.json({
          status: "success",
          data,
          totalData,
          totalPages,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
