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

    let sponsorKey = null;
    if ([4].includes(user.roleId)) {
      sponsorKey = await SponsorKey.findOne({
        attributes: ["id", "userId", "key"],
        where: { userId: user.id },
      });
    }

    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {}; // upline roleId 4

    const includeParent = [
      {
        attributes: [
          "id",
          "name",
          "username",
          "email",
          "phone",
          "point",
        ],
        model: User, //downline
        where: {
          ...keyword,
        },
      },
      {
        attributes: ["id", "userId", "key"],
        model: SponsorKey,
        where: {
          ...queryMember,
          ...keyword,
        },
        include: {
          attributes: [
            "id",
            "name",
            "username",
            "email",
            "phone",
            "point",
          ],
          model: User, //upline
        },
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
