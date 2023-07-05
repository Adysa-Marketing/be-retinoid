const { TrReward, Reward, Referral, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
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
      id: "string|empty:false",
      rewardId: "string|empty:false",
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
      userId: user.id,
      rewardId: source.rewardId,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};
    const trReward = await TrReward.findOne({
      attributes: ["id", "statusId", "rewardId", "imageKtp"],
      where: {
        id: parseInt(source.id),
        ...queryMember,
      },
    });

    if (!trReward) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward tidak ditemukan",
      });
    }

    const reward = await Reward.findOne({ where: { id: source.rewardId } });
    if (!reward) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });
    }

    /**
     * Jika login sbg member dan status tr !== 1 (pending)
     */
    if (![1].includes(trReward.statusId)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward tidak dapat diubah",
      });
    }

    /**
     * Ketika item reward berubah, cek apakah user sudah pernah ambil reward baru atau belum
     */
    if (trReward.rewardId !== parseInt(source.rewardId)) {
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
      const checkPoint = referral.filter(
        (ref) => ref.User.point >= reward.point
      );
      if (checkPoint.length >= reward.minFoot) {
        // buat transaksi
        await trReward.update(payload);
        return res.status(200).json({
          status: "success",
          message:
            "Data transaksi Reward berhasil diperbarui, silahkan menunggu admin untuk melakukan pengecekan",
        });
      } else {
        RemoveImg(files, false);
        return res.status(400).json({
          status: "error",
          message:
            "Mohon maaf, Anda tidak memenuhi kriteria untuk melakukan transaksi ini",
        });
      }
    }

    await RemoveImg(trReward, true);

    await trReward.update(payload);
    return res.status(200).json({
      status: "success",
      message:
        "Data transaksi Reward berhasil diperbarui, silahkan menunggu admin untuk melakukan pengecekan",
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
