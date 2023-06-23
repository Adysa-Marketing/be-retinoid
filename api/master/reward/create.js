const { Reward } = require("../../../models");
const logger = require("../../../libs/logger");

module.exports = async (req, res) => {
  const source = req.user;
  const files = req.files;
  try {
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

    logger.info({source, files, payload})

    await Reward.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Reward berhasil dibuat",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
