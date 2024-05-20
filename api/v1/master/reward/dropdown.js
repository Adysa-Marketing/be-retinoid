const { Reward, Referral, User, TrReward } = require("../../../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sanitizeHtml = require("sanitize-html");

module.exports = async (req, res) => {
  try {
    const user = req.user;

    Reward.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "image",
        "point",
        "minFoot",
        "remark",
        "amount",
      ],
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
            rw.description = sanitizeHtml(rw.description, {
              allowedTags: [],
              allowedAttributes: {},
            });
            const point = rw.point;
            const minFoot = rw.minFoot;
            let status = false; //status diperbolehkan amnbil reward
            let already = false; //status pernah claim [pending, approved, delivered]

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

              // sudah pernah di claim
              if (checkOldTr) {
                already = true;
              }

              if (!checkOldTr && checkPoint.length >= minFoot) {
                status = true;
              }

              // jika user belum memiliki akun level / akun level bukan gold(2) maka user tidak boleh claim reward
              if (!user.AccountLevelId || user.AccountLevelId != 2) {
                status = false;
              }
            }

            return {
              ...rw,
              status,
              already,
            };
          })
        );

        return res.json({
          status: "success",
          data,
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
