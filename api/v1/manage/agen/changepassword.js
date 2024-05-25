const { User, Agen } = require("../../../../models");
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
    // const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const password = source.password;

    logger.info(source);
    const agen = await Agen.findByPk(id);
    if (!agen)
      return res.status(404).json({
        status: "error",
        message: "Data Agen tidak ditemukan",
      });

    const account = await User.findOne({
      attributes: ["id", "name", "password"],
      where: { id: agen.userId, roleId: 3 },
    });
    if (!account)
      return res.status(404).json({
        status: "error",
        message: "Account tidak ditemukan",
      });

    await account.update({ password });
    return res.json({
      status: "success",
      message: "Password Agen berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
