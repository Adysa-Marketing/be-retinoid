const { User, Serial } = require("../../models");
const logger = require("../../libs/logger");
const db = require("../../models");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

module.exports = async (req, res) => {
  const source = req.body;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const sponsorKey = cryptoString({ length: 10, type: "base64" });
    const { countryId, provinceId, districtId, subDistrictId } = source;

    // check serial
    const serial = await Serial.fineOne({
      attributes: ["id", "serial", "status"],
      where: {
        serial: source.serial,
        status: 0,
      },
    });

    if (!serial) {
      return res.status(500).json({
        status: "error",
        message: "Kode Serial sudah pernah digunakan",
      });
    }

    const payload = {
      name: source.name,
      username: source.username,
      email: source.email,
      password,
      phone: source.phone,
      sponsorKey,
      roleId: 4,
      serialId: serial.id,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
    };

    logger.info({ source, payload });

    await User.create(payload, { transaction });
    await serial.update({ status: 1 }, { transaction });

    transaction.commit()
    return res.json({
      status: "success",
      message: "Registrasi Berhasil",
    });
  } catch (err) {
    console.log(err);
    transaction.rollback();
    if (err.errors && err.errors.length > 0 && err.errors[0].path) {
      logger.err(err.errors);
      if (err.errors[0].path == "email") {
        return res.status(400).json({
          status: "error",
          message: "Email sudah terdaftar, silahkan gunakan email lain",
        });
      } else if (err.errors[0].path == "username") {
        return res.status(400).json({
          status: "error",
          message: "Username sudah terdaftar, silahkan gunakan username lain",
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "No HP sudah terdaftar, silahkan gunakan No HP lain",
        });
      }
    } else {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }
};
