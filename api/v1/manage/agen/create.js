const { User, Agen, Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../models");
const { RemoveFile } = require("./asset");

const bcrypt = require("bcryptjs");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  try {
    const schema = {
      stokisId: "string|empty:false",
      name: "string|empty:false",
      username: "string|empty:false",
      password: "string|empty:false|min:5",
      email: "email|empty:false",
      phone: "string|optional|min:9|max:13",
      gender: {
        type: "string",
        enum: ["Male", "Female"],
        optional: true,
      },
      kk: "string|optional",
      address: "string|optional",
      noRekening: "string|optional",
      countryId: "number|optional",
      districtId: "number|optional",
      subDistrictId: "number|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const { countryId, provinceId, districtId, subDistrictId } = source;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      username: source.username,
      email: source.email,
      password,
      phone: source.phone,
      kk: source.kk,
      address: source.address,
      noRekening: source.noRekening,
      roleId: 3,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
      ...image,
    };

    logger.info({ source, payload });

    const stokis = await Stokis.findByPk(source.stokisId);
    if (!stokis)
      return res.status(404).json({
        status: "error",
        message: "Data Stokis tidak ditemukan",
      });

    const userData = await User.create(payload, { transaction });

    const payloadAgen = {
      name: userData.name,
      status: 0,
      userId: userData.id,
      stokisId: stokis.id,
      remark: source.remark,
    };

    await Agen.create(payloadAgen, { transaction });

    transaction.commit();
    return res.json({
      status: "success",
      message: "Data Admin berhasil dibuat",
    });
  } catch (err) {
    console.log("[!] Error : ", err);
    await RemoveFile(files, false);
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
