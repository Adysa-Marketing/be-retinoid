const { User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const bcrypt = require("bcryptjs");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      id: "number|empty:false",
      password: "string|empty:false|min:5",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = source.id;
    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));

    logger.info(source);
    const user = await User.findOne({
      attributes: ["id", "name", "password"],
      where: { id, roleId: 4 },
    });
    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Data User tidak ditemukan",
      });

    await user.update({ password });
    return res.status(404).json({
      status: "success",
      message: "Password User berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
