const {
  AccountLevel,
  Commission,
  User,
  CommissionLevel,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const moment = require("moment");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;

    const schema = {
      levelId: "number|optional",
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

    const startDate = moment(source.startDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();
    const endDate = moment(source.endDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();
    const queryLevel = source.levelId ? { levelId: source.levelId } : {};

    /**
     *  list berdasarka userId member / admin
     *  admin bisa lihat semua data commission / lihat commission nya sendiri
     *  member hanya bisa lihat commission nya sendiri
     * */

    const queryMember =
      user && [3, 4].includes(user.roleId)
        ? { id: user.id }
        : user && [1, 2].includes(user.roleId) && source.userId
        ? { id: source.userId }
        : {};

    const dateRange =
      source.startDate && source.endDate
        ? {
            date: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          }
        : {};

    const where = {
      ...dateRange,
      ...queryLevel,
    };

    const includeParent = [
      {
        attributes: ["id", "name"],
        as: "Upline",
        model: User,
        where: {
          ...queryMember,
        },
        include: [
          {
            attributes: ["id", "name"],
            model: AccountLevel,
          },
        ],
      },
      {
        attributes: ["id", "name"],
        as: "Downline",
        model: User,
        include: [
          {
            attributes: ["id", "name"],
            model: AccountLevel,
          },
        ],
      },
      {
        attributes: ["id", "name", "percent", "level"],
        model: CommissionLevel,
      },
    ];
    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Commission.count({
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

    await Commission.findAll({
      ...offsetLimit,
      attributes: ["id", "amount", "date", "remark"],
      where,
      include: [...includeParent],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));
        const data = result.map((comm) => {
          comm.date = moment(comm.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return comm;
        });

        return res.json({
          status: "success",
          data,
          totalData,
          totalPages,
        });
      })
      .catch((error) => {
        console.log("[!] Error : ", error);
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
