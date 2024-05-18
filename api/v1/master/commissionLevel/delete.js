const {
  Commission,
  Generation,
  CommissionLevel,
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
    const commissionLevel = await CommissionLevel.findOne({
      attributes: ["id", "name"],
      where: { id },
      include: [
        {
          attributes: ["id"],
          model: Commission,
        },
        {
          attributes: ["id"],
          model: Generation,
        },
      ],
    });

    logger.info({ id });
    if (!commissionLevel)
      return res.status(404).json({
        status: "error",
        message: "Data Level Akun tidak ditemukan",
      });

    // JIKA LEVEL KOMISI SUDAH DIPAKAI, MAKA LEVEL KOMISI TIDAK BOLEH DIHAPUS
    if (
      commissionLevel.Commissions?.length ||
      commissionLevel.Generations?.length
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Data Level Komisi tidak dapat di hapus karena memiliki relasi ke tabel lain",
      });
    }

    await commissionLevel.destroy();

    return res.json({
      status: "success",
      message: "Data Level Komisi berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
