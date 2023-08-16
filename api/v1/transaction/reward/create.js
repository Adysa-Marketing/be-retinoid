const { TrReward, Reward, Referral, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");

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
      rewardId: "string|empty:false",
      address: "string|empty:false",
      remark: "string|optional",
    };

    const RemoveImg = async (img, option) =>
      files &&
      files.imageKtp &&
      files.imageKtp.length > 0 &&
      (await RemoveFile(img, option));

    const validate = v.compile(schema)(source);
    if (validate.length) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const imageKtp =
      files && files.imageKtp && files.imageKtp.length > 0
        ? { imageKtp: files.imageKtp[0].filename }
        : {};

    const payload = {
      ...imageKtp,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      userId: user.id,
      rewardId: parseInt(source.rewardId),
      statusId: 1,
      address: source.address,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const reward = await Reward.findOne({
      attributes: ["id", "point", "minFoot"],
      where: { id: source.rewardId },
    });
    if (!reward) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });
    }

    const checkTrReward = await TrReward.findOne({
      where: {
        userId: source.userId ? source.userId : user.id,
        rewardId: source.rewardId,
        statusId: {
          [Op.in]: [1, 4, 5],
        },
      },
    });

    if (checkTrReward) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf permintaan anda tidak dapat di proses. Anda sudah pernah melakukan transaksi untuk item reward ini",
      });
    }

    // cek apakah user memenuhi kriteria untuk meminta reward atau tidak
    const referral = await Referral.findAll({
      where: { sponsorId: user.sponsorId },
      include: {
        attributes: ["id", "name", "point"],
        model: User,
      },
    });

    if (!referral) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf, Anda tidak memenuhi kriteria untuk melakukan transaksi ini",
      });
    }

    // jika ada referral. lakukan pengecekan apakah boleh ambil reward atau tidak berdasarkan point referral
    const checkPoint = referral.filter((ref) => ref.User.point >= reward.point);
    if (checkPoint.length >= reward.minFoot) {
      // buat transaksi
      await TrReward.create(payload);
      return res.status(201).json({
        status: "success",
        message:
          "Permintaan anda berhasil diproses, silahkan menunggu admin untuk melakukan pengecekan",
      });
    } else {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf, Anda tidak memenuhi kriteria untuk melakukan transaksi ini",
      });
    }
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
