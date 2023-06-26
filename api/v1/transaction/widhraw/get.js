const { User, Widhraw, WdStatus } = require("../../../../models");
const logger = require("../../../../libs/logger");

const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    const queryMember = [4].includes(user.id) ? { userId: user.id } : {};

    let widhraw = await Widhraw.findOne({
      where: { id, ...queryMember },
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

    logger.info(id);
    if (!widhraw)
      return res
        .status(404)
        .json({ status: "error", message: "Data Widhraw tidak ditemukan" });

    widhraw.createdAt = moment(widhraw.createdAt)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    return res.json({
      status: "success",
      data: widhraw,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
