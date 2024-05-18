const {
  AccountLevel,
  User,
  CommissionLevel,
  Serial,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
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
    const accountLevel = await AccountLevel.findOne({
      attributes: ["id", "name", "amount", "remark"],
      include: [
        {
          attributes: ["id", "name"],
          model: User,
        },
        {
          attributes: ["id", "name"],
          model: CommissionLevel,
        },
        {
          attributes: ["id", "serialNumber"],
          model: Serial,
        },
      ],
    });

    logger.info({ id });
    if (!accountLevel)
      return res.status(404).json({
        status: "error",
        message: "Data Level Akun tidak ditemukan",
      });

    // JIKA AKUN LEVEL SUDAH DIPAKAI, MAKA AKUN LEVEL TIDAK BOLEH DIHAPUS
    if (
      accountLevel.Users?.length ||
      accountLevel.CommissionLevels?.length ||
      accountLevel.Serials?.length
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Data Level Akun tidak dapat di hapus karena memiliki relasi ke tabel lain",
      });
    }

    await accountLevel.destroy();

    return res.json({
      status: "success",
      message: "Data Level Akun berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
