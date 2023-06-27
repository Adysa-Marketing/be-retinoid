const { User } = require("../../../models");
const logger = require("../../../libs/logger");

const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require("sequelize");

module.exports.SendOtp = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      email: "email|optional",
      phone: "string|optional|min:9|max:13",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    logger.info(source);

    const email = source.email ? { email: source.email } : {};
    const phone = source.phone ? { phone: source.phone } : {};

    const user = await User.findOne({
      attributes: ["id", "name", "email", "phone"],
      where: {
        ...phone,
        ...email,
      },
    });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Email atau No Hp tidak ditemukan",
      });

    const verCode = cryptoString({ length: 6, type: "numeric" });
    await user.update({ verCode });
    const message = `Adysa Marketing : Halo *${user.name}*, Kode verifikasi anda adalah *${verCode}*`;

    // send message to wa

    res.json({
      status: "success",
      message: "Kode verifikasi berhasil dikirim melalui WhatsApp",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.Confirm = async (req, res) => {
  try {
    const schema = {
      verCode: "string|optional|min:6|max:6",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    logger.info(source);

    const verCode = req.body.verCode;
    const user = await User.findOne({
      attributes: ["id", "name", "email", "phone", "verCode"],
      where: { verCode },
    });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Maaf, Kode verifikasi salah / sudah kadaluarsa",
      });

    return res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.ResetChange = async (req, res) => {
  try {
    const schema = {
      userId: "number|optional",
      verCode: "optional",
      password: "string|empty:false|min:5",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    logger.info(source);

    const queryId = source.userId ? { id: source.userId } : {};
    const queryVerCode = source.verCode ? { verCode: source.verCode } : {};

    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));

    const user = await User.findOne({
      attributes: ["id", "name"],
      where: {
        [Op.or]: {
          ...queryId,
          ...queryVerCode,
        },
      },
      raw: true,
    });

    if (!user)
      return res.status(400).json({
        status: "error",
        message: "Gagal mengganti password",
      });

    user.update({ verCode: null, password });
    return res.json({
      status: "success",
      message: "Password berhasil diganti",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
