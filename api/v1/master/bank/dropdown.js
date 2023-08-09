const { Bank } = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const data = await Bank.findAll({
      attributes: ["id", "name", "noRekening", "accountName"],
    });
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
