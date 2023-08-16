const { TrReward } = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  console.log("source", source);

  try {
    const schema = {
      id: "number|empty:false",
      statusId: {
        type: "number",
        empty: false,
        enum: [1, 2, 3, 4, 5],
      },
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
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};

    logger.info({ source, payload });

    const trReward = await TrReward.findOne({
      attributes: ["id", "statusId", "rewardId"],
      where: { id, ...queryMember },
    });

    if (!trReward)
      return res.status(404).json({
        status: "error",
        message: "Data Tramsaksi Reward tidak ditemukan",
      });

    /**
     * Jika login sbg member dan status tr !== 1 (pending) dan source.status !==2 (canceled)
     */
    if (
      [3, 4].includes(user.roleId) && //member
      [1].includes(trReward.statusId) && // tr.stat !== 1
      ![2].includes(parseInt(source.statusId)) // source.stat !== 2
    )
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward tidak dapat diubah",
      });

    /**
     * Tr tidak dapat dirubah ketika status awal nya (canceled, rejected, delivered)
     */
    if ([2, 3, 5].includes(trReward.statusId))
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward sudah tidak dapat diubah",
      });

    await trReward.update(payload);

    return res.json({
      status: "success",
      message: "Status Transaksi Reward berhasil diperbarui",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
