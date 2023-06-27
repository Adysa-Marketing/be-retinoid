const { TrReward, Reward } = require("../../../../models");
const logger = require("../../../../libs/logger");

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  const user = req.user;
  const files = req.files;

  try {
    const schema = {
      id: "number|empty:false",
      date: "string|optional",
      userId: "number|optional",
      rewardId: "number|optional",
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
      ...imageKtp,
      date: source.date,
      userId: source.userId ? source.userId : user.id,
      rewardId: source.rewardId,
      statusId: source.statusId,
      remark: source.remark,
    };

    logger.info({ source, payload });

    const reward = await Reward.findOne({ where: { id: source.rewardId } });
    if (!reward)
      return res.status(404).json({
        status: "error",
        message: "Data Reward tidak ditemukan",
      });

    const queryMember = [4].includes(user.roleId) ? { userId: user.id } : {};
    const trReward = await TrReward.findOne({
      where: {
        id: source.id,
        ...queryMember,
      },
    });

    if (!trReward)
      return res.status(404).json({
        status: "error",
        message: "Mohon maaf, Data Transaksi Reward tidak ditemukan",
      });

    /**
     * Jika login sbg member dan status tr !== 1 (pending) dan source.status !==2 (canceled)
     */
    if (
      [4].includes(user.roleId) && //member
      ![1].includes(trReward.statusId) && // tr.stat !== 1
      ![2].includes(source.statusId) // source.stat !== 2
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

    files &&
      files.imageKtp &&
      files.imageKtp.length > 0 &&
      (await RemoveFile(trReward, true));

    await trReward.update(payload);
    return res.stus(201).json({
      status: "success",
      message:
        "Permintaan transaksi anda berhasil diperbarui, silahkan menunggu admin untuk melakukan pengecekan",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    await RemoveFile(files, false);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
