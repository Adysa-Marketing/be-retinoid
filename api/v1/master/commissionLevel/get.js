const {
  AccountLevel,
  CommissionLevel,
  Commission,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }
    const id = req.params.id;
    const commissionLevel = await CommissionLevel.findOne({
      attributes: ["id", "name", "percent", "level", "remark"],
      where: { id },
      include: [
        {
          attributes: ["id", "name", "amount"],
          model: AccountLevel,
        },
        {
          attributes: ["id"],
          model: Commission,
        },
      ],
    });

    logger.info({ id });

    if (!commissionLevel)
      return res.status(404).json({
        status: "error",
        message: "Data Level Komisi tidak ditemukan",
      });

    return res.json({
      status: "success",
      data: commissionLevel,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
