const { User, Widhraw, WdStatus } = require("../../../../models");
const { RemoveFile } = require("./asset");
const logger = require("../../../../libs/logger");

const sequelize = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  const transaction = await db.sequelize.transaction({ autocommit: false });

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
    const queryMember = [4].includes(user.id) ? { userId: user.id } : {};

    const widhraw = await Widhraw.findOne({
      attributes: ["id", "userId", "amount", "statudId", "imageKtp", "image"],
      where: { id, ...queryMember },
      include: [
        {
          attributes: ["id", "name", "remark"],
          model: WdStatus,
        },
      ],
    });

    logger.info(id);
    if (!widhraw)
      return res.status(404).json({
        status: "error",
        message: "Data Widhraw tidak ditemukan",
      });

    if (
      widhraw.WdStatus.name !== "Pending" ||
      ![1].includes(widhraw.statusId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Mohon maaf, Data Widhraw tidak dapat dihapus",
      });
    }

    await RemoveFile(widhraw, true);
    await User.update(
      { wallet: sequelize.col("wallet") + widhraw.amount },
      { transaction }
    );
    await widhraw.destroy({ transaction });

    transaction.commit();
    return res.json({
      status: "success",
      message: "Data Widhraw berhasil dihapus",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
