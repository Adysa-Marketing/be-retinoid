const { TrReward, Reward, Referral, User } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
const wabot = require("../../../../libs/wabot");

const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sanitizeHtml = require("sanitize-html");
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

    // jika user accoune level bukan gold maka di tolak untuk ambil reward
    if (!user.AccountLevelId || user.AccountLevelId != 2) {
      return res.status(400).json({
        status: "error",
        message:
          "Mohon maaf permintaan anda tidak dapat di proses. Hanya akun dengan level GOLD yang dapat melakukan permintaan berikut",
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
      attributes: ["id", "name", "description", "point", "minFoot"],
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

      const userData = await User.findOne({
        attributes: ["id", "phone", "username"],
        where: { id: user.id },
      });

      let deskripsiReward = sanitizeHtml(reward.description, {
        allowedTags: [],
        allowedAttributes: {},
      });

      wabot.Send({
        to: userData.phone,
        message: `*[Transaksi Reward] - ADYSA MARKETING*\n\nHi *${userData.username}*, permintaan reward berhasil dengan detail : \n\n1. Item : *${reward.name}* \n2. Persyaratan : Minimal *${reward.minFoot}* kaki/downline dengan masing-masing *${reward.point}* point tiap kaki/downline \n3. Deskripsi : ${deskripsiReward} \n4. Alamat Pengiriman : ${source.address} \n\nData yang anda ajukan akan segera di proses oleh admin, mohon kesediaan-nya untuk menunggu. \n\nTerimakasih`,
      });

      User.findOne({
        attributes: ["id", "phone", "username"],
        where: {
          roleId: 1,
        },
      })
        .then((superadmin) => {
          if (superadmin && superadmin.phone) {
            wabot.Send({
              to: superadmin.phone,
              message: `[Notif Transaksi] - ADYSA MARKETING\n\nHi *${superadmin.username}*, ada pengajuan reward dari member dengan detail : \n\n1. Username : *${userData.username}* \n2. Item : *${reward.name}* \n3. Persyaratan : Minimal *${reward.minFoot}* kaki/downline dengan masing-masing *${reward.point}* point tiap kaki/downline \n4. Deskripsi : ${deskripsiReward} \n5. Alamat Pengiriman : ${source.address} \n\nSegera lakukan pengecekan melalui panel dashboard \n\nTerimakasih`,
            });
          }
        })
        .catch((err) => {
          console.log("[!] Error Find SuperAdmin : ", err);
        });

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
