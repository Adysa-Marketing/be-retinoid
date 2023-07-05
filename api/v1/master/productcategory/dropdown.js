const { ProductCategory } = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const data = await ProductCategory.findAll({
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
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
