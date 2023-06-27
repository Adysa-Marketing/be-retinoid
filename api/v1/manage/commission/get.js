const { Commission, User, CommissionLevel } = require("../../../../models");
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

    const queryMember =
      user && [4].includes(user.roleId) ? { userId: user.id } : {};

    let commission = await Commission.findOne({
      where: { id, ...queryMember },
      include: [
        {
          attributes: ["id", "name", "username", "email", "phone"],
          as: "Upline",
          model: User,
        },
        {
          attributes: ["id", "name", "username", "email", "phone"],
          as: "Downline",
          model: User,
        },
        {
          attributes: ["id", "name", "percent"],
          model: CommissionLevel,
        },
      ],
    });

    if (!commission)
      return res.status(404).json({
        status: "error",
        message: "Data Komisi tidak ditemukan",
      });

    commission = JSON.parse(JSON.stringify(commission));
    commission.date = moment(commission.date)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: commission,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
