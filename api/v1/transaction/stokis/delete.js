const { TrStokis, User } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");
const wabot = require("../../../../libs/wabot");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;

  try {
    const schema = {
      id: "number|empty:false",
    };

    const validate = v.compile(schema)(req.body);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.body.id;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};

    const trStokis = await TrStokis.findOne({
      attributes: ["id", "userId", "stokisId", "statusId", "image", "imageKtp"],
      where: { id, ...queryMember },
    });

    logger.info({ id });
    if (!trStokis)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Stokis tidak ditemukan",
      });

    if (![1, 2].includes(trStokis.statusId))
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Stokis tidak dapat dihapus",
      });

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: trStokis.userId },
    });

    await RemoveFile(trStokis, true);
    await trStokis.destroy();

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Stokis] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi stokis anda berhasil dihapus. apabila anda telah melakukan transfer pembayaran, harap menghubungi admin untuk melakukan pengembalian pembayaran dengan menyertakan data diri dan bukti transfer yang telah dilakukan \n\nTerimakasih`,
    });

    return res.json({
      status: "success",
      message: "Data Transaksi Stokis berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
