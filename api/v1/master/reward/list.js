const { Reward, Referral, User, TrReward } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;
    const schema = {
      keyword: "string|optional",
      rowsPerPage: "number|empty:false",
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
                  Sequelize.fn("lower", Sequelize.col("Reward.name")),
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

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Reward.count({ where: { ...keyword } });

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

    Reward.findAll({
      ...offsetLimit,
      attributes: ["id", "name", "description", "point", "image", "minFoot"],
      where: { ...keyword },
      order: [["id", "ASC"]],
    })
      .then(async (result) => {
        result = JSON.parse(JSON.stringify(result));
        let userRefferal = null;

        // jika login role 3 dan 4. lakukan pengecekan apakah boleh ambil reward atau tidak berdasarkan point refferal
        if ([3, 4].includes(user.roleId)) {
          userRefferal = await Referral.findAll({
            where: { sponsorId: user.sponsorId },
            include: {
              attributes: ["id", "name", "point"],
              // as: "Downline",
              model: User,
            },
          });
        }

        const data = await Promise.all(
          result.map(async (rw) => {
            const point = rw.point;
            const minFoot = rw.minFoot;
            let status = false; //status diperbolehkan amnbil reward

            // jika ada reffreal. lakukan pengecekan apakah boleh ambil reward atau tidak berdasarkan point refferal
            if (userRefferal) {
              const checkPoint = userRefferal.filter(
                (ref) => ref.User.point >= point
              );

              // cek sudah pernah transaksi reward atau belum,
              const checkOldTr = await TrReward.findOne({
                attributes: ["id"],
                where: {
                  userId: user.id,
                  rewardId: rw.id,
                  statusId: {
                    [Op.in]: [1, 4, 5], //pending, approved, delivered
                  },
                },
              });

              if (!checkOldTr && checkPoint.length >= minFoot) {
                status = true;
              }
            }

            return {
              ...rw,
              status,
            };
          })
        );

        return res.json({
          status: "success",
          data,
          totalData,
          totalPages,
        });
      })
      .catch((error) => {
        console.log("[!] Error : ", error);
        return res.status(400).json({
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
