const { User } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
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

    const admin = await User.findOne({ id });
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
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
