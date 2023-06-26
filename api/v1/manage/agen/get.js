const { User, Agen } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
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
    const agen = await Agen.findOne({
      include: [
        {
          attributes: ["id", "name", "username", "email", "phone", "image"],
          model: User,
        },
      ],
    });

    logger.info(id);
    if (!agen)
      return res
        .status(404)
        .json({ status: "error", message: "Data Agen tidak ditemukan" });

    delete agen.password;
    return res.json({
      status: "success",
      data: agen,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
