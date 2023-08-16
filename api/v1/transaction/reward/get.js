const { TrReward, Reward, RwStatus, User } = require("../../../../models");
const logger = require("../../../../libs/logger");

const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    let trReward = await TrReward.findOne({
      attributes: ["id", "imageKtp", "date", "address", "remark"],
      where: { id, ...queryMember },
      include: [
        {
          attributes: ["id", "name", "username", "phone", "kk"],
          model: User,
        },
        {
          attributes: ["id", "name"],
          model: RwStatus,
        },
        {
          attributes: ["id", "name", "point", "minFoot"],
          model: Reward,
        },
      ],
    });

    logger.info({ id });
    if (!trReward)
      return res
        .status(404)
        .json({ status: "error", message: "Data Reward tidak ditemukan" });

    trReward.date = moment(trReward.date)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    return res.json({
      status: "success",
      data: trReward,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
