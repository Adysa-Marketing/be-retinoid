const logger = require("../../../libs/logger");
const Session = require("../../../libs/session");

const {
  User,
  SponsorKey,
  Serial,
  Agen,
  Stokis,
  Role,
  Country,
  Province,
  District,
  SubDistrict,
} = require("../../../models");

const bcryptjs = require("bcryptjs");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      username: "string|empty:false",
      password: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const { username, password } = source;
    const attributes = {
      exclude: ["createdAt", "updatedAt"],
    };

    const userData = await User.findOne({
      attributes,
      include: [
        {
          attributes: ["id", "key"],
          model: SponsorKey,
        },
        {
          attributes: ["id", "serialNumber", "status"],
          model: Serial,
        },
        {
          attributes: ["id", "name"],
          model: Role,
        },
        {
          attributes: ["id", "name"],
          model: Country,
        },
        {
          attributes: ["id", "name"],
          model: Province,
        },
        {
          attributes: ["id", "name"],
          model: District,
        },
        {
          attributes: ["id", "name"],
          model: SubDistrict,
        },
      ],
      where: {
        username,
      },
    });

    if (!userData)
      return res
        .status(404)
        .json({ status: "error", message: "Username atau Password Salah" });

    if (!userData.isActive)
      return res.status(401).json({
        status: "error",
        message:
          "Akun anda tidak aktif, Silahkan hubungi customer service untuk konfirmasi",
      });

    // if (bcryptjs.compareSync(password, userData.password)) {
    if (password === userData.password) {
      let user = JSON.parse(JSON.stringify(userData));
      if ([3].includes(userData.roleId)) {
        let dataAgen = await Agen.findOne({
          attributes: ["id", "name"],
          where: { userId: userData.id },
          include: {
            attributes: ["id", "agenDiscount"],
            model: Stokis,
          },
        });
        dataAgen = JSON.parse(JSON.stringify(dataAgen));
        user.profit = dataAgen?.Stoki?.agenDiscount;
      }
      delete user.password;

      const token = await Session.sign(user);
      logger.info({ user });
      return res.status(200).json({ status: "success", data: { user, token } });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "Username atau Password Salah" });
    }
  } catch (error) {
    console.log("[!] Error : ", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
