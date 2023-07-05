const { Reward } = require("../../../../models");
const { RemoveFile } = require("./asset");

const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  try {
    const schema = {
      id: "string|optional",
      name: "string|optional",
      description: "string|optional",
      point: "string|optional",
      minFoot: "string|optional",
      amount: "string|optional",
    };

    const RemoveImg = async (img, option) =>
      files &&
      files.image &&
      files.image.length > 0 &&
      (await RemoveFile(img, option));

    const validate = v.compile(schema)(source);
    if (validate.length) {
      await RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const id = source.id;
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      name: source.name,
      description: source.description,
      point: source.point,
      minFoot: source.minFoot,
      amount: source.amount,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const reward = await Reward.findByPk(id);
    if (!reward) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });
    }

    RemoveImg(reward, true);
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
