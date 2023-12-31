const { User, Generation, CommissionLevel } = require("../../../../models");
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
    logger.info({ id });
    const queryUpline = ![1].includes(user.roleId) ? { userId: user.id } : {};

    const generation = await Generation.findOne({
      attributes: ["id", "remark"],
      where: {
        id,
        ...queryUpline,
      },
      include: [
        {
          attributes: ["id", "name", "email", "phone", "isActive"],
          as: "Upline",
          model: User,
        },
        {
          attributes: ["id", "name", "email", "phone", "isActive"],
          as: "Downline",
          model: User,
        },
        {
          attributes: ["id", "name", "percent"],
          model: CommissionLevel,
        },
      ],
    });

    if (!generation)
      return res.status(404).json({
        status: "error",
        message: "Data generasi tidak ditemukan",
      });

    generation.createdAt = moment(generation.createdAt)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: generation,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
