const env = process.env.NODE_ENV;
const config = require("../../../../config/core")[env];
const { Reward, RwStatus, TrReward, User } = require("../../../../models");
const logger = require("../../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const id =
      source.keyword.length > 3
        ? source.keyword.substr(3, source.keyword.length - 1)
        : 0;
    const keycode = !isNaN(id) ? { id } : {};

    const keyword = source.keyword
      ? {
          [Op.or]: [
            {
              id: !isNaN(source.keyword) ? parseInt(source.keyword) : 0,
            },
            {
              ...keycode,
            },
          ],
        }
      : {};
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

    const queryName = source.keyword ? { name: source.keyword } : {};
    const queryStatus = source.statusId ? { statusId: source.statusId } : {};
    const queryReward = source.rewardId ? { rewardId: source.rewardId } : {};
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    const where = {
      ...keyword,
      ...dateRange,
      ...queryMember,
      ...queryReward,
      ...queryStatus,
    };

    const includeParent = [
      {
        attribute: ["id", "name", "email", "phone"],
        model: User,
        where: { ...queryName },
      },
      {
        model: RwStatus,
      },
      {
        model: Reward,
      },
    ];
    logger.info(source);

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await TrReward.count({
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

    await TrReward.findAll({
      ...offsetLimit,
      where,
      include: [...includeParent],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((trRw) => {
          const code = trRw.id.toString().padStart(config.maxFill, 0);
          trRw.date = moment(trRw.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...trRw,
            kode: `TRR${code}`,
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
