const { User } = require("../../../models");
const logger = require("../../../libs/logger");
const wabot = require("../../../libs/wabot");

const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require("sequelize");
const moment = require("moment");
const sha = require("js-sha512").sha512;
const bcrypt = require("bcryptjs");

module.exports.SendOtp = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      username: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    logger.info(source);

    const username = source.username ? { username: source.username } : {};

    const user = await User.findOne({
      attributes: ["id", "username", "phone", "isActive"],
      where: {
        ...username,
      },
    });

    if (!user) {
      return res.status(500).json({
        status: "error",
        message: "Username tidak terdaftar",
      });
    }

    if (!user.isActive) {
      return res.status(500).json({
        status: "error",
        message:
          "Status account tidak aktif, silahkan hubungi admin untuk melakukan aktivasi account anda",
      });
    }

    const verCode = cryptoString({ length: 6, type: "numeric" });
    await user.update({ verCode });

    // send message to wa
    const message = `*[VERIFIKASI OTP] - ADYSA MARKETING*\n\nHi *${user.username}*, Kode verifikasi anda adalah : *${verCode}* . Kode ini berlalu selama 15 menit. JANGAN BERIKAN kode ini ke siapapun.`;
    wabot.Send({
      to: user.phone,
      message,
    });

    res.json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.Verify = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      userId: "number|empty:false",
      verCode: "string|empty:false",
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
      attributes: ["id", "verCode", "isActive", "updatedAt"],
      where: { id: source.userId },
    });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Maaf akses ditolak",
      });

    if (!user.isActive) {
      return res.status(500).json({
        status: "error",
        message:
          "Status account tidak aktif, silahkan hubungi admin untuk melakukan aktivasi account anda",
      });
    }

    if (verCode !== user.verCode) {
      return res.status(400).json({
        status: "error",
        message: "Kode OTP salah",
      });
    }

    // jika verifikasi lewat dari 15 menit, maka error
    const currentTime = moment();
    const createdAtMoment = moment(user.updatedAt, "YYYY-MM-DD HH:mm:ss.SSSZ");
    const timeDifferenceInMinutes = currentTime.diff(
      createdAtMoment,
      "minutes"
    );

    if (timeDifferenceInMinutes > 15) {
      return res.status(500).json({
        status: "error",
        message: "Kode OTP anda sudah kadaluarsa",
      });
    }

    const confirmCode = sha(req.clientIp + moment());
    await user.update({ confirmCode });

    return res.json({
      status: "success",
      data: confirmCode,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.IsValid = async (req, res) => {
  const confirmCode = req.body.confirmCode;
  try {
    const user = await User.findOne({
      attributes: ["id", "name"],
      where: { confirmCode },
    });
    if (user) {
      return res.status(200).send();
    } else {
      return res.status(400).send();
    }
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.ResetChange = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      userId: "number|optional",
      confirmCode: "string|empty:false",
      password: "string|empty:false|min:5",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const queryId = source.userId ? [{ id: source.userId }] : [];
    const queryCode = source.confirmCode
      ? [{ confirmCode: source.confirmCode }]
      : [];

    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));

    const user = await User.findOne({
      attributes: ["id", "name", "username", "phone"],
      where: {
        [Op.and]: [...queryId, ...queryCode],
      },
    });

    if (!user)
      return res.status(400).json({
        status: "error",
        message: "Gagal mengganti password",
      });

    await User.update(
      { verCode: null, confirmCode: null, password },
      { where: { id: user.id } }
    );

    wabot.Send({
      to: user.phone,
      message: `*[PASSWORD RESET] - ADYSA MARKETING*\n\nHi *${user.username}*, Password anda berhasil diubah. Demi menjaga keamanan account anda, JANGAN BERIKAN password anda kepada siapapun.`,
    });

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
