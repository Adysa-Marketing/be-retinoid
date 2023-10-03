const {
  User,
  Serial,
  Referral,
  SponsorKey,
  CommissionLevel,
  Commission,
  Generation,
} = require("../../../models");
const logger = require("../../../libs/logger");
const db = require("../../../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");
const moment = require("moment");
const wabot = require("../../../libs/wabot");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const transaction = await db.sequelize.transaction({ autocommit: false });
  let isRegistered = false;
  let upliner = null;
  let dataNotification = [];

  try {
    const schema = {
      name: "string|empty:false",
      username: {
        type: "string",
        pattern: /^[^\s]*$/,
        messages: {
          pattern: "Username tidak boleh menggunakan spasi",
        },
        empty: false,
      },
      password: "string|empty:false|min:5",
      passwordConfirm: "string|empty:false|min:5",
      email: "email|empty:false",
      phone: {
        type: "string",
        pattern: /^(08|628)[0-9]{9,13}$/,
        messages: {
          pattern: "No Telpon Tidak Valid",
        },
        min: 9,
        max: 13,
        empty: false,
      },
      serial: "string|empty:false",
      referral: "string|empty:false",
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

    if (source.password !== source.passwordConfirm) {
      return res.status(400).json({
        status: "error",
        message: "Password Konfirmasi salah",
      });
    }

    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const sponsorKey = cryptoString({ length: 10, type: "alphanumeric" });
    const { countryId, provinceId, districtId, subDistrictId, referral } =
      source;

    // check serial
    const serial = await Serial.findOne({
      attributes: ["id", "status", "serialNumber"],
      where: {
        [Op.and]: [
          {
            status: 1,
          },
          {
            serialNumber: source.serial,
          },
        ],
      },
    });

    if (!serial) {
      return res.status(500).json({
        status: "error",
        message: "Kode Serial salah / sudah pernah digunakan",
      });
    }

    // check sponsorKey
    const sponsor = await SponsorKey.findOne({
      where: {
        key: referral,
      },
    });

    if (!sponsor) {
      return res.status(500).json({
        status: "error",
        message: "Kode Referral tidak ditemukan",
      });
    }

    const payload = {
      name: source.name,
      username: source.username,
      email: source.email,
      password,
      phone: source.phone.replace("08", "628"),
      gender: source.gender,
      kk: source.kk,
      address: source.address,
      roleId: 4,
      serialId: serial.id,
      countryId: countryId ? countryId : 1,
      provinceId: provinceId ? provinceId : null,
      districtId: districtId ? districtId : null,
      subDistrictId: subDistrictId ? subDistrictId : null,
    };

    logger.info({ source, payload });

    const userData = await User.create(payload, { transaction });
    // create sponsorKey
    const userSponsor = await SponsorKey.create(
      { userId: userData.id, key: sponsorKey },
      { transaction }
    );
    await userData.update({ sponsorId: userSponsor.id }, { transaction });

    // create referral
    await Referral.create(
      {
        userId: userData.id,
        sponsorId: sponsor.id,
      },
      { transaction }
    );

    // update status serial
    await serial.update({ status: 2 }, { transaction });

    // proses commission 5 level
    const productAmount = 500000;
    const commissionLevel = await CommissionLevel.findOne({ where: { id: 1 } });
    const commission = parseInt(
      (commissionLevel.percent * productAmount) / 100
    );
    const userUpliner = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: sponsor.userId },
    });
    const message = `*[Bonus Generasi] - ADYSA MARKETING*\n\nHi *${
      userUpliner.username
    }*, Selamat anda mendapatkan bonus generasi senilai *Rp. ${new Intl.NumberFormat(
      "id-ID"
    ).format(commission)}* dari downline *${
      userData.name
    }* dengan kedalaman *level 1*`;

    await Commission.create(
      {
        userId: sponsor.userId,
        downlineId: userData.id,
        amount: commission,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        levelId: commissionLevel.id,
        remark: message,
      },
      { transaction }
    );

    // set data notification for upliner
    if (userUpliner && userUpliner.phone) {
      const payloadNotif = {
        to: userUpliner.phone,
        message,
      };
      dataNotification.push(payloadNotif);
    }
    // end set data notification for upliner

    // create generation
    await Generation.create(
      {
        userId: sponsor.userId,
        downlineId: userData.id,
        levelId: commissionLevel.id,
        remark: commissionLevel.name,
      },
      { transaction }
    );

    // update wallet
    await User.update(
      { wallet: sequelize.literal(`wallet + ${commission}`) },
      { where: { id: sponsor.userId }, transaction }
    );

    // proses commission
    await calculateDownlineBonus(
      sponsor.userId, // id penyeponsor
      productAmount, // 500.000
      2, // level
      userData.id, // id downline
      userData.name, // name of downline
      dataNotification, // data notification
      transaction // db transactional
    );

    transaction.commit();

    // condition for calculate downline in the upliner
    isRegistered = true;
    upliner = sponsor.userId;

    // notification success regist
    const phone = source.phone.replace("08", "628");
    wabot.Send({
      to: phone,
      message: `*[Pendaftaran Member] - ADYSA MARKETING*\n\nHi *${source.username}*, Selamat pendaftaran anda telah berhasil`,
    });
    // end notifikasi wa bot

    return res.status(201).json({
      status: "success",
      message: "Registrasi Berhasil",
    });
  } catch (err) {
    console.log("[!] Error : ", err);
    transaction.rollback();
    if (err.errors && err.errors.length > 0 && err.errors[0].path) {
      logger.error(err.errors);
      if (err.errors[0].path == "username") {
        return res.status(400).json({
          status: "error",
          message: "Username sudah terdaftar, silahkan gunakan username lain",
        });
      }
    } else {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  } finally {
    if (isRegistered && upliner != null) {
      await calculatePoint(upliner);
      // send wa notification
      for (const payload of dataNotification) {
        await wabot.Send(payload);
      }
    }
  }
};

const calculateDownlineBonus = async (
  userSponsorId, //uplineId
  amount, // 500.000
  level, // commission level
  downlineId, // id downline
  downlineName, // name of downline
  dataNotification, // data notification
  transaction // db transactional
) => {
  if (level > 5) {
    return;
  }
  let referral = await Referral.findOne({
    attributes: ["userId", "sponsorId"],
    where: { userId: userSponsorId },
    include: [
      {
        attributes: ["userId", "key"],
        model: SponsorKey,
        required: true,
      },
    ],
  });
  // jika tidak ada sponsorId langsung return
  if (!referral) {
    return;
  }
  referral = JSON.parse(JSON.stringify(referral));

  const userUplineId = referral.SponsorKey.userId;
  const commissionLevel = await CommissionLevel.findOne({
    where: { id: level },
  });
  const commission = (commissionLevel.percent * amount) / 100;
  const userUpliner = await User.findOne({
    attributes: ["id", "username", "phone"],
    where: { id: userUplineId },
  });
  const message = `*[Bonus Generasi] - ADYSA MARKETING*\n\nHi *${
    userUpliner.username
  }*, Selamat anda mendapatkan bonus generasi senilai *Rp. ${new Intl.NumberFormat(
    "id-ID"
  ).format(
    commission
  )}* dari downline *${downlineName}* dengan kedalaman *level ${level}*`;

  // create commission
  await Commission.create(
    {
      userId: userUplineId,
      downlineId: downlineId,
      amount: commission,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      levelId: commissionLevel.id,
      remark: message,
    },
    { transaction }
  );

  // set data notification for upliner
  if (userUpliner && userUpliner.phone) {
    const payloadNotif = {
      to: userUpliner.phone,
      message,
    };
    dataNotification.push(payloadNotif);
  }
  // end set data notification for upliner

  // create generation
  await Generation.create(
    {
      userId: userUplineId,
      downlineId: downlineId,
      levelId: commissionLevel.id,
      remark: commissionLevel.name,
    },
    { transaction }
  );

  // update wallet
  await User.update(
    { wallet: sequelize.literal(`wallet + ${commission}`) },
    { where: { id: userUplineId }, transaction }
  );

  // kurang notification wa untuk info commission masuk

  await calculateDownlineBonus(
    userUplineId,
    amount,
    level + 1,
    downlineId,
    downlineName,
    dataNotification,
    transaction
  );
};

const calculatePoint = async (userSponsorId) => {
  try {
    // menambahkan jumlah point kepada upline
    const user = await User.findByPk(userSponsorId);
    if (!user) return;

    await user.update({ point: sequelize.literal(`point + 1`) });

    let referral = await Referral.findOne({
      attributes: ["userId", "sponsorId"],
      where: { userId: userSponsorId },
      include: [
        {
          attributes: ["userId", "key"],
          model: SponsorKey,
          required: true,
        },
      ],
    });
    // jika tidak ada sponsorId langsung return
    if (!referral || !referral.sponsorId) {
      return;
    }
    referral = JSON.parse(JSON.stringify(referral));

    // next uplineId
    const userUplineId = referral.SponsorKey.userId;

    await calculatePoint(userUplineId);
  } catch (error) {
    console.log("[!] Error :", error);
  }
};
