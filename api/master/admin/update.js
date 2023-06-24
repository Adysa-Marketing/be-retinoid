const { User } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      username: "string|optional",
      password: "string|optional|min:5",
      email: "email|optional",
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

    const id = source.id;
    const password = source.password
      ? bcrypt.hashSync(source.password, bcrypt.genSaltSync(2))
      : {};
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
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
      ...image,
    };

    logger.info({ source, files, payload });

    const admin = await User.findByPk(id);
    if (!admin)
      return res.status(404).json({
        status: "error",
        message: "Data Admin tidak ditemukan",
      });

    files && files.image && (await RemoveFile(admin, true));
    await admin.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Admin berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
