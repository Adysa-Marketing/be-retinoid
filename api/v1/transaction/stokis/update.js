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
      userId: "number|optional",
      stokisId: "number|optional",
      amount: "number|optional",
      paymentTypeId: "number|optional",
      kk: "string|optional",
      phoneNumber: "string|optional",
      fromBank: "string|optional",
      accountName: "string|optional",
      bankId: "number|optional",
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
      userId: source.id,
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

    const id = req.body.id;
    const queryMember = [4].includes(user.id) ? { userId: user.id } : {};
    const trStokis = await TrStokis.findOne({
      where: {
        id,
        ...queryMember,
        statusId: 1,
      },
    });

    if (!trStokis)
      return res.status(404).json({
        status: "error",
        message:
          "Data Transaksi Stokis tidak ditemukan / tidak boleh di update",
      });

    files && files.imageKtp && (await RemoveFile(trStokis.imageKtp, true));

    await trStokis.upadate(payload);
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
