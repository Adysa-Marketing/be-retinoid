const { User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const bcrypt = require("bcryptjs");
const wabot = require("../../../../libs/wabot");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      password: "string|empty:false|min:5",
      oldPassword: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.user.id;
    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));

    logger.info(source);
    const user = await User.findOne({
      attributes: ["id", "name", "username", "password", "phone"],
      where: { id },
    });
    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Data User tidak ditemukan",
      });

    if (!bcrypt.compareSync(source.oldPassword, user.password)) {
      return res.status(400).json({
        status: "error",
        message: "Password lama yang anda masukkan salah",
      });
    }

    await user.update({ password });

    wabot.Send({
      to: user.phone,
      message: `*[PASSWORD RESET] - ADYSA MARKETING*\n\nHi *${user.username}*, Password anda berhasil diubah. Demi menjaga keamanan account anda, JANGAN BERIKAN password anda kepada siapapun.`,
    });

    return res.json({
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
