const { User, SponsorKey, Refferal } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");

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
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn("lower", Sequelize.col("Refferal.User.name")),
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

    const sponsorKey = await SponsorKey.findOne({ where: { userId: user.id } });

    const where = {
      ...keyword,
      sponsorId: sponsorKey.id,
    };
    const includeParent = [
      {
        attributes: [
          "id",
          "name",
          "username",
          "email",
          "phone",
          "totalDownline",
        ],
        model: User,
      },
    ];

    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Refferal.count({
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

    await Refferal.findAll({
      ...offsetLimit,
      where,
      include: [...includeParent],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((ref) => {
          ref.date = moment(ref.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        });

        return res.json({
          status: "success",
          data,
          sponsorKey,
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
