const { TrReward, Reward } = require("../../../../models");
const logger = require("../../../../libs/logger");

const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      date: "string|optional",
      userId: "number|optional",
      rewardId: "number|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const imageKtp =
      files && files.imageKtp && files.imageKtp.length > 0
        ? { imageKtp: files.imageKtp[0].filename }
        : {};

    const payload = {
      ...imageKtp,
      date: moment().format("YYYY-DD-MM HH:mm:ss"),
      userId: source.userId ? source.userId : user.id,
      rewardId: source.rewardId,
      statusId: 1,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const reward = await Reward.findOne({ where: { id: source.rewardId } });
    if (!reward)
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });

    const checkTrReward = await TrReward.findOne({
      where: {
        userId: source.userId ? source.userId : user.id,
        rewardId: source.rewardId,
        statusId: {
          [Op.in]: [1, 4, 5],
        },
      },
    });

    if (checkTrReward)
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf permintaan anda tidak dapat di proses. Anda sudah pernah melakukan transaksi untuk item reward ini",
      });

    await TrReward.create(payload);
    return res.stus(201).json({
      status: "success",
      message:
        "Permintaan anda berhasil diproses, silahkan menunggu admin untuk melakukan pengecekan",
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
