const { TrStokis } = require("../../../../models");
const logger = require("../../../../libs/logger");
const { RemoveFile } = require("./asset");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const files = req.files;
  const user = req.user;
  try {
    const schema = {
      userId: "number|optional",
      stokisId: "number|empty:false",
      amount: "number|empty:false",
      paymentTypeId: "number|empty:false",
      kk: "string|empty:false",
      phoneNumber: "string|empty:false",
      fromBank: "string|empty:false",
      accountName: "string|empty:false",
      bankId: "number|empty:false",
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
      userId: [4].includes(user.roleId) ? user.id : source.userId,
      stokisId: source.stokisId,
      amount: source.amount,
      paymentTypeId: source.paymentTypeId,
      statusId: 1,
      kk: source.kk,
      phoneNumber: source.phoneNumber,
      fromBank: source.fromBank,
      accountName: source.accountName,
      bankId: source.bankId,
      ...imageKtp,
      remark: source.remark,
    };

    logger.info({ source, files, payload });

    await TrStokis.create(payload);
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
      messag: error.message,
    });
  }
};
