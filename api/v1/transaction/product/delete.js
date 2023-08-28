const { TrSale, User } = require("../../../../models");
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

    if (![3].includes(user.roleId)) {
      RemoveImg(files, false);
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf anda tidak dapat melakukan transaksi ini",
      });
    }

    const id = req.body.id;
    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};

    const trSale = await TrSale.findOne({
      attributes: ["id", "userId", "statusId", "image"],
      where: { id, ...queryAgen },
    });

    logger.info({ id });
    if (!trSale)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Produk tidak ditemukan",
      });

    if (![1, 2, 3].includes(trSale.statusId)) {
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Produk tidak dapat dihapus",
      });
    }

    const userData = await User.findOne({
      attributes: ["id", "username", "phone"],
      where: { id: trSale.userId },
    });

    await RemoveFile(trSale, true);
    await trSale.destroy();

    wabot.Send({
      to: userData.phone,
      message: `*[Transaksi Produk] - ADYSA MARKETING*\n\nHi *${userData.username}*, Transaksi Produk anda berhasil dihapus. apabila anda telah melakukan transfer pembayaran, harap menghubungi admin untuk melakukan pengembalian pembayaran dengan menyertakan data diri dan bukti transfer yang telah dilakukan \n\nTerimakasih`,
    });

    return res.json({
      status: "success",
      message: "Data Transaksi Produk berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
