const {
  User,
  Serial,
  Referral,
  SponsorKey,
  CommissionLevel,
  Commission,
} = require("../../models");
const logger = require("../../libs/logger");
const db = require("../../models");
const sequelize = require("sequelize");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");
const moment = require("moment");

module.exports = async (req, res) => {
  const source = req.body;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));
    const sponsorKey = cryptoString({ length: 10, type: "base64" });
    const { countryId, provinceId, districtId, subDistrictId, referral } =
      source;

    // check serial
    const serial = await Serial.fineOne({
      where: {
        serial: source.serial,
        status: 0,
      },
    });

    if (!serial) {
      return res.status(500).json({
        status: "error",
        message: "Kode Serial sudah pernah digunakan",
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
      phone: source.phone,
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
      { userId: userData.userId, key: sponsorKey },
      { transaction }
    );
    await userData.update({ sponsorId: userSponsor.id }, { transaction });

    // create referral
    await Referral.create(
      {
        userId: userData.id,
        sponsorId: userSponsor.id,
      },
      { transaction }
    );

    // update status serial
    await serial.update({ status: 1 }, { transaction });

    // proses commission 5 level
    const productAmount = 500000;
    const commissionLevel = await CommissionLevel.findAll();
    const commission = parseInt(
      (commissionLevel[0].percent * productAmount) / 100
    );
    const message = `Selamat anda mendapatkan bonus senilai Rp. ${commission} dari downline ${commission[0].name} dengan kedalaman level 1`;
    await Commission.create(
      {
        userId: sponsor.userId,
        downlineId: userData.id,
        amount: commission,
        date: moment().format("YYYY-MM-DD"),
        levelId: commissionLevel[0].id,
        remark: message,
      },
      { transaction }
    );

    // update wallet
    await User.upate(
      { wallet: sequelize.col("wallet") + commission },
      { where: { id: sponsor.userId }, transaction }
    );

    // kurang notification wa bot untuk info commission masuk

    // end notifikasi wa bot

    await calculateDownlineBonus(
      sponsor.userId, // id penyeponsor
      productAmount, // 500.000
      2, // level
      userData.id, // id downline
      transaction // db transactional
    );
    // proses commission

    transaction.commit();
    return res.json({
      status: "success",
      message: "Registrasi Berhasil",
    });
  } catch (err) {
    console.log("[!] Error : ", err);
    transaction.rollback();
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

const calculateDownlineBonus = async (
  userSponsorId, //uplineId
  amount, // 500.000
  level, // commission level
  downlineId, // id downline
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
        attributes: ["userId", "sponsorKey"],
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

  const userUplineId = referral.SponsorKey[0].userId;
  const commissionLevel = await CommissionLevel.findAll();
  const commission = (commissionLevel[level - 1].percent * amount) / 100;
  const message = `Selamat anda mendapatkan bonus senilai Rp. ${commission} dari downline ${
    commission[level - 1].name
  } dengan kedalaman level ${level}`;

  // create commission
  await Commission.create(
    {
      userId: userUplineId,
      downlineId,
      amount: commission,
      date: moment().format("YYYY-MM-DD"),
      levelId: commissionLevel[level - 1].id,
      remark: message,
    },
    { transaction }
  );

  // update wallet
  await User.upate(
    { wallet: sequelize.col("wallet") + commission },
    { where: { id: userUplineId }, transaction }
  );

  // kurang notification wa untuk info commission masuk

  await calculateDownlineBonus(
    userUplineId,
    amount,
    level + 1,
    downlineId,
    transaction
  );
};