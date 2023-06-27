const { TrStokis } = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;

  try {
    const schema = {
      id: "number|empty:false",
      statusId: "number|empty:false",
      remark: "string|optional",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const payload = {
      statusId: source.statusId,
      remark: source.remark,
    };

    const id = source.id;
    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};

    const trStokis = await TrStokis.findOne({
      attributes: ["id", "userId", "stokisId", "statusId"],
      where: {
        id,
        ...queryMember,
      },
    });

    if (!trStokis)
      return res.status(404).json({
        status: "error",
        message: "Data Transaksi Stokis tidak ditemukan",
      });

    if (
      [4].includes(user.roleId) && // member
      trStokis.status !== 1 && // Pending
      ![2].includes(source.statusId) // status 2 == canceled
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Anda tidak diizinkana mengubah status data ini!",
      });

    await trStokis.update(payload);
    logger.info({ source, payload });
    transaction.commit();
    return res.json({
      status: "success",
      message: "Status Transaksi Stokis berhasil diubah",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
