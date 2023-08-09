const { User } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");

const bcrypt = require("bcryptjs");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  try {
    const schema = {
      id: "string|empty:false",
      name: "string|optional",
      username: "string|optional",
      password: "string|optional|min:5",
      email: "string|optional",
      phone: "string|optional|min:9|max:13",
      gender: {
        type: "string",
        enum: ["Male", "Female"],
        optional: true,
      },
      kk: "string|optional",
      address: "string|optional",
      countryId: "string|optional",
      districtId: "string|optional",
      subDistrictId: "string|optional",
      remark: "string|optional",
    };

    const RemoveImg = async (img, option) =>
      files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(img, option));

    const validate = v.compile(schema)(source);
    if (validate.length) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const id = source.id;
    const password = source.password
      ? { password: bcrypt.hashSync(source.password, bcrypt.genSaltSync(2)) }
      : {};
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const { countryId, provinceId, districtId, subDistrictId } = source;

    const payload = {
      name: source.name,
      username: source.username,
      email: source.email,
      ...password,
      phone: source.phone.replace('08', '628'),
      kk: source.kk,
      address: source.address,
      gender: source.gender,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const admin = await User.findOne({ where: { id, roleId: 2 } });
    if (!admin) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Admin tidak ditemukan",
      });
    }

    RemoveImg(admin, true);
    await admin.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Admin berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    if (error.errors && error.errors.length > 0 && error.errors[0].path) {
      if (error.errors[0].path == "username") {
        return res.status(400).json({
          status: "error",
          message: "Username sudah terdaftar, silahkan gunakan username lain",
        });
      }
    } else {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
};
