const { User, Agen } = require("../../../../models");
const logger = require("../../../../libs/logger");
const bcrypt = require("bcryptjs");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  try {
    const schema = {
      id: "number|empty:false",
      password: "string|empty:false",
      oldPassword: "string|optional",
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

    if (user && [3].includes(user.roleId)) {
      // validate old password
      if (!source.oldPassword)
        return res.status(400).json({
          status: "error",
          message: "Tolong inputkan password lama anda",
        });

      if (!bcrypt.compareSync(source.oldPassword, account.password)) {
        return res.status(400).json({
          status: "error",
          message: "Password lama yang anda masukkan salah",
        });
      }
    }

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