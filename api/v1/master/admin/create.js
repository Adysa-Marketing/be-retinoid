const { User, SponsorKey } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const { RemoveFile } = require("./asset");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  try {
    const schema = {
      name: "string|empty:false",
      username: {
        type: "string",
        pattern: /^[^\s]*$/,
        messages: {
          stringPattern: "Username tidak boleh menggunakan spasi",
        },
        empty: false,
      },
      password: "string|empty:false|min:5",
      repeatPassword: "string|empty:false|min:5",
      email: "string|empty:false",
      phone: "string|empty:false|min:9|max:13",
      gender: {
        type: "string",
        enum: ["Male", "Female"],
        optional: true,
      },
      kk: "string|optional",
      address: "string|optional",
      noRekening: "string|optional",
      countryId: "string|optional",
      districtId: "string|optional",
      subDistrictId: "string|optional",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      files &&
        files.image &&
        files.image.length > 0 &&
        (await RemoveFile(files, false));
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }
    if (source.password !== source.repeatPassword) {
      return res.status(400).json({
        status: "error",
        message: "Comfirm password salah",
      });
    }
    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const sponsorKey = cryptoString({ length: 10, type: "base64" });
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
      roleId: 2,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
      ...image,
    };

    logger.info({ source, payload });

    const userData = await User.create(payload, { transaction });
    // create sponsorKey
    const userSponsor = await SponsorKey.create(
      { userId: userData.id, key: sponsorKey },
      { transaction }
    );
    await userData.update({ sponsorId: userSponsor.id }, { transaction });

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
      if (err.errors[0].path == "username") {
        return res.status(400).json({
          status: "error",
          message: "Username sudah terdaftar, silahkan gunakan username lain",
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
