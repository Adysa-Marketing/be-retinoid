const { Reward } = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const data = await Reward.findAll({ attributes: ["id", "name"] });

    return res.json({
      status: "success",
      data,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
