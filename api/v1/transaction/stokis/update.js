const { TrStokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");

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
      phoneNumber: "string|optional",
      fromBank: "string|optional",
      accountName: "string|optional",
      stokisId: "string|optional",
      userId: "string|optional",
      paymentTypeId: "string|optional",
      bankId: "string|optional",
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
      stokisId: source.stokisId,
      amount: source.amount,
      paymentTypeId: source.paymentTypeId,
      userId: source.userId ? source.userId : user.id,
      statusId: 1,
      kk: source.kk,
      phoneNumber: source.phoneNumber,
      fromBank: source.fromBank,
      accountName: source.accountName,
      bankId: source.bankId,
      ...imageKtp,
      ...image,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    const id = source.id;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};
    const trStokis = await TrStokis.findOne({
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

    RemoveImg(trStokis, true);

    await trStokis.update(payload);
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
