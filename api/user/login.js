const logger = require("../../libs/logger");
const Session = require("../../libs/session");

const { User, SponsorKey, Serial } = require("../../models");

const bcryptjs = require("bcryptjs");

module.exports = async (req, res) => {
  const { username, password } = req.body;

  try {
    const attributes = {
      exclude: ["countryId", "provinceId", "districtId", "subDistrictId"],
    };

    const userData = await User.findOne({
      attributes,
      include: [
        {
          model: SponsorKey,
        },
        {
          model: Serial,
        },
      ],
      where: {
        $or: [
          {
            username,
          },
          {
            email: username,
          },
        ],
        isActive: true,
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

    if (bcryptjs.compareSync(password, userData.password)) {
      let user = JSON.parse(JSON.stringify(userData));
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
    logger.error(err);
    res.status(500).json({ status: "error", message: error.message });
  }
};