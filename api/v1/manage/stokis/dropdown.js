const { Stokis } = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const data = await Stokis.findAll();

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
