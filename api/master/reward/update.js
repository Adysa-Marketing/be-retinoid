const { Reward } = require("../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
    const id = source.id;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      description: source.description,
      point: source.point,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const reward = await Reward.findOne({ id });
    if (!reward)
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });

    files && files.image && (await RemoveFile(reward, true));
    await reward.update(payload);

    return res.status(200).json({
      status: "success",
      message: "Data Reward berhasil diperbarui",
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
