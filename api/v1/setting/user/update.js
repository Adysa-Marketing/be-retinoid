const { User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const files = req.files;
  const source = req.body;

  try {
    const schema = {
      id: "number|empty:false",
      name: "string|optional",
      email: "email|optional",
      phone: "string|optional|min:9|max:13",
      gender: {
        type: "string",
        enum: ["Male", "Female"],
        optional: true,
      },
      kk: "string|optional",
      address: "string|optional",
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
    const { countryId, provinceId, districtId, subDistrictId, referral } =
      source;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      email: source.email,
      phone: source.phone,
      gender: source.gender,
      kk: source.kk,
      address: source.address,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const user = await User.findOne({ attributes: ["id", "name", "image"] });
    if (!user)
      return res.status(404).json({
        status: "error",
        message: "Data User tidak ditemukan",
      });

    files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(user, true));

    await User.update(payload, { where: { id } });
    return res.json({
      status: "success",
      message: "Data User berhasil diperbarui",
    });
  } catch (err) {
    console.log("[!] Error : ", err);
    await RemoveFile(files, true);
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
