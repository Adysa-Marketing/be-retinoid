const { ATrSale } = require("../../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../../libs/logger");
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

    const aTrSale = await ATrSale.findOne({
      attributes: ["id", "userId", "statusId", "image"],
      where: { id, userId: user.id },
    });

    logger.info({ id });
    if (!aTrSale)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Produk tidak ditemukan",
      });

    if (![1, 2, 3].includes(aTrSale.statusId)) {
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Produk tidak dapat dihapus",
      });
    }

    await RemoveFile(aTrSale, true);
    await aTrSale.destroy();

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
