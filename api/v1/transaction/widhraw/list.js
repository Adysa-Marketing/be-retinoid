const { User, Widhraw, WdStatus } = require("../../../../models");
const logger = require("../../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const startDate = moment(source.startDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();
    const endDate = moment(source.endDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();

    const dateRange =
      source.startDate && source.endDate
        ? {
            createdAt: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          }
        : {};

    const queryStatus = source.statusId ? { statusId: source.statusId } : {};
    const queryMember = [4].includes(user.id) ? { userId: user.id } : {};

    const where = {
      ...queryStatus,
      ...queryMember,
      ...dateRange,
    };

    logger.info(source);

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Widhraw.count({
      where,
      include: [
        {
          attribute: ["id", "name", "email", "phone"],
          model: User,
        },
        {
          attribute: ["id", "name", "remark"],
          model: WdStatus,
        },
      ],
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

    await Widhraw.findAll({
      ...offsetLimit,
      where,
      include: [
        {
          attribute: ["id", "name", "email", "phone"],
          model: User,
        },
        {
          attribute: ["id", "name", "remark"],
          model: WdStatus,
        },
      ],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((wd) => {
          wd.createdAt = moment(wd.createdAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          wd.updatedAt = moment(wd.updatedAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...wd,
          };
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
