const { Stokis, Agen } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
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

    const id = source.id;
    if ([1, 2].includes(id)) {
      return res.status(404).json({
        status: "error",
        message: "Stokis tidak boleh dihapus",
      });
    }

    const stokis = await Stokis.findOne({
      where: { id },
      include: { attributes: ["id"], model: Agen },
    });

    if (!stokis) {
      return res.status(404).json({
        status: "error",
        message: "Stokis tidak ditemukan",
      });
    }

    logger.info({ source });
    if (stokis.Agens.length) {
      return res.status(400).json({
        status: "error",
        message:
          "Gagal menghapus Stokis, Data Stokis sudah terdaftar untuk beberapa agen",
      });
    }

    await stokis.destroy();
    return res.json({
      status: "success",
      message: "Data Stokis berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
