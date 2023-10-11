const { TrStokis, User, Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
const wabot = require("../../../../libs/wabot");
const { Op } = require("sequelize");
const sanitizeHtml = require("sanitize-html");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  const user = req.user;
  try {
    const schema = {
      amount: "string|empty:false",
      kk: "string|empty:false",
      fromBank: "string|optional",
      accountName: "string|optional",
      phoneNumber: {
        type: "string",
        pattern: /^(08|628)[0-9]{9,13}$/,
        messages: {
          pattern: "No Telpon Tidak Valid",
        },
        min: 9,
        max: 13,
        empty: false,
      },
      userId: "string|optional",
      stokisId: "string|empty:false",
      paymentTypeId: "string|empty:false",
      bankId: "string|optional",
      address: "string|empty:false",
      countryId: "string|empty:false",
      provinceId: "string|empty:false",
      districtId: "string|empty:false",
      subDistrictId: "string|empty:false",
      remark: "string|optional",
    };

    const RemoveImg = async (img, option) => {
      ((files && files.image && files.image.length > 0) ||
        (files.imageKtp && files.imageKtp.length > 0)) &&
        (await RemoveFile(img, option));
    };

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
    const image =
      files && files.image && files.image.length > 0
        ? { image: files.image[0].filename }
        : {};

    const payload = {
      userId: source.userId ? source.userId : user.id,
      stokisId: source.stokisId,
      amount: source.amount,
      paymentTypeId: source.paymentTypeId,
      statusId: 1,
      kk: source.kk,
      phoneNumber: source.phoneNumber.replace("08", "628"),
      fromBank: source.fromBank,
      accountName: source.accountName,
      bankId: source.bankId,
      countryId: source.countryId ? source.countryId : 1,
      address: source.address,
      provinceId: source.provinceId,
      districtId: source.districtId,
      subDistrictId: source.subDistrictId,
      ...imageKtp,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const checkTrStokis = await TrStokis.findOne({
      where: {
        userId: source.userId ? source.userId : user.id,
        statusId: {
          [Op.in]: [1, 4, 5],
        },
      },
    });

    if (checkTrStokis) {
      return res.status(400).json({
        status: "error",
        message:
          "Permintaan gagal, anda sudah pernah melakukan transaksi serupa",
      });
    }

    const checkDataStokis = await Stokis.findOne({
      attributes: ["id", "name", "discount", "description"],
      where: {
        id: source.stokisId,
      },
    });

    if (!checkDataStokis) {
      return res.status(400).json({
        status: "error",
        message: "Permintaan gagal, data stokis tidak ditemukan",
      });
    }

    await TrStokis.create(payload);

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });

    let deskripsiStokis = sanitizeHtml(checkDataStokis.description, {
      allowedTags: [],
      allowedAttributes: {},
    });

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${
        userData.username
      }*, pengajuan transaksi Stokis anda berhasil dengan detail : \n\n1. Nama Stokis : *${
        checkDataStokis.name
      }* \n2. Harga : *Rp.${new Intl.NumberFormat("id-ID").format(
        checkDataStokis.discount
      )}* \n3. Deskripsi : ${deskripsiStokis} \n\nData yang anda ajukan akan segera di proses oleh admin, mohon kesediaan-nya untuk menunggu. \n\nTerimakasih`,
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
            message: `[Notif Transaksi] - ADYSA MARKETING\n\nHi *${
              superadmin.username
            }*, ada pendaftaran agen stokis dengan detail : \n\n1. Username : *${
              userData.username
            }* \n2. Nama Stokis : *${
              checkDataStokis.name
            }* \n3. Harga : *Rp.${new Intl.NumberFormat("id-ID").format(
              checkDataStokis.discount
            )}* \n4. Deskripsi : ${deskripsiStokis} \n\nSegera lakukan pengecekan melalui panel dashboard \n\nTerimakasih`,
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
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
