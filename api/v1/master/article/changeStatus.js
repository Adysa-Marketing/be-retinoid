const { Article } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      statusId: "number|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const isActive = source.statusId == 1 ? true : false;

    logger.info(source);
    const serial = await Article.findByPk(id);
    if (!serial)
      return res.status(404).json({
        status: "error",
        message: "Data Article tidak ditemukan",
      });

    await serial.update({ isActive });
    return res.json({
      status: "success",
      message: "Status Article berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
