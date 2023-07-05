const { User, Widhraw } = require("../../../../models");
const logger = require("../../../../libs/logger");
const db = require("../../../../models");
const { RemoveFile } = require("./asset");

const bcryptjs = require("bcryptjs");
const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;
  const transaction = await db.sequelize.transaction({ autocommit: false });

  try {
    const schema = {
      amount: "string|empty:false",
      noRekening: "string|empty:false",
      bankName: "string|empty:false",
      accountName: "string|empty:false",
      password: "string|empty:false",
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
      userId: user.id,
      amount: parseInt(source.amount),
      statusId: 1,
      noRekening: source.noRekening,
      bankName: source.bankName,
      accountName: source.accountName,
      ...imageKtp,
      remark: source.remark,
    };

    logger.info({ files, payload });

    const userData = await User.findOne({
      attributes: ["id", "wallet", "password"],
      where: { id: user.id },
    });

    // validate password
    if (!bcryptjs.compareSync(source.password, userData.password)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message:
          "Maaf permintaan anda gagal, Password yang anda masukkan tidak sesuai",
      });
    }

    // minimal widhraw
    if (parseInt(source.amount) < 50000) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message:
          "Maaf permintaan anda gagal, Nominal minimal widhraw senilai Rp. 50.000",
      });
    }

    // check wallet
    if (userData.wallet < parseInt(source.amount)) {
      RemoveImg(files, false);
      return res.status(400).json({
        status: "error",
        message: "Maaf permintaan anda gagal, Saldo anda tidak mencukupi",
      });
    }

    // create
    await Widhraw.create(payload, { transaction });
    // update wallet
    await userData.update(
      { wallet: sequelize.literal(`wallet - ${parseInt(source.amount)}`) },
      { transaction }
    );

    transaction.commit();
    return res.status(201).json({
      status: "success",
      message:
        "Permintaan anda berhasil diproses, silahkan menunggu admin untuk melakukan pengecekan",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    transaction.rollback();
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
