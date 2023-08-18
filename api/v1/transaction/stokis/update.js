const { TrStokis, User, Stokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");
const wabot = require("../../../../libs/wabot");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;
  try {
    const schema = {
      id: "string|empty:false",
      amount: "string|optional",
      kk: "string|optional",
      phoneNumber: {
        type: "string",
        pattern: /^(08|628)[0-9]{9,13}$/,
        messages: {
          pattern: "No Telpon Tidak Valid",
        },
        min: 9,
        max: 13,
        optional: true,
      },
      fromBank: "string|optional",
      accountName: "string|optional",
      stokisId: "string|optional",
      userId: "string|optional",
      paymentTypeId: "string|optional",
      bankId: "string|optional",
      address: "string|optional",
      countryId: "string|optional",
      provinceId: "string|optional",
      districtId: "string|optional",
      subDistrictId: "string|optional",
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
      amount: source.amount,
      paymentTypeId: source.paymentTypeId,
      userId: source.userId ? source.userId : user.id,
      statusId: 1,
      kk: source.kk,
      phoneNumber: source.phoneNumber.replace("08", "628"),
      fromBank: source.fromBank,
      accountName: source.accountName,
      address: source.address,
      countryId: source.countryId ? source.countryId : 1,
      provinceId: source.provinceId,
      districtId: source.districtId,
      subDistrictId: source.subDistrictId,
      bankId: source.bankId,
      ...imageKtp,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const id = source.id;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};
    const trStokis = await TrStokis.findOne({
      attributes: ["id", "stokisId"],
      where: {
        id,
        ...queryMember,
        statusId: 1,
      },
    });

    if (!trStokis) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message:
          "Data Transaksi Stokis tidak ditemukan / tidak boleh di update",
      });
    }

    const checkDataStokis = await Stokis.findOne({
      attributes: ["id", "name", "discount", "description"],
      where: {
        id: source.stokisId ? source.stokisId : trStokis.stokisId,
      },
    });

    if (!checkDataStokis) {
      return res.status(400).json({
        status: "error",
        message: "Permintaan gagal, data stokis tidak ditemukan",
      });
    }

    RemoveImg(trStokis, true);

    await trStokis.update(payload);

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: user.id },
    });

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${
        userData.username
      }*, update tarsaksi Stokis anda berhasil dengan detail : \n\n1. Nama Stokis : *${
        checkDataStokis.name
      }* \n2. Harga : *Rp.${new Intl.NumberFormat("id-ID").format(
        checkDataStokis.discount
      )}* \n3. Deskripsi : ${
        checkDataStokis.description
      } \n\nData yang anda ajukan akan segera di proses oleh admin, mohon kesediaan-nya untuk menunggu. \n\nTerimakasih`,
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
