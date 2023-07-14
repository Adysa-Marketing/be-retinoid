const env = process.env.NODE_ENV;
const config = require("../../../../config/core")[env];
const { Mutation, User, TrSale } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const schema = {
      type: "string|optional",
      category: "string|optional",
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

    const dateRange =
      source.startDate && source.endDate
        ? {
            date: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          }
        : {};

    const queryType = source.type ? { type: source.type } : {};
    const queryCategory = source.category ? { category: source.category } : {};

    const where = {
      ...dateRange,
      ...queryType,
      ...queryCategory,
    };

    logger.info(source);

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Mutation.count({
      where,
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

    await Mutation.findAll({
      ...offsetLimit,
      attributes: ["id", "type", "category", "amount", "remark", "createdAt"],
      where,
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));
        const data = result.map((mutation) => {
          mutation.date = moment(mutation.createdAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return mutation;
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
