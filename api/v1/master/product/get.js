const {
  Product,
  ProductCategory,
  Agen,
  Stokis,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;
    let product = await Product.findOne({
      attributes: [
        "id",
        "name",
        "amount",
        "image",
        "description",
        "stock",
        "remark",
      ],
      where: { id },
      include: {
        attributes: ["id", "name", "remark"],
        model: ProductCategory,
      },
    });

    logger.info({ id });
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Data Produk tidak ditemukan" });

    if (
      [1, 2].includes(product.ProductCategory.id) &&
      [3].includes(user.roleId)
    ) {
      let discount = 0;
      discount =
        product.ProductCategory.id == 1
          ? parseInt(user.profit) * 2
          : product.ProductCategory.id == 2
          ? parseInt(user.profit)
          : 0;

      product = JSON.parse(JSON.stringify(product));
      product.discount = discount;
    }

    return res.json({
      status: "success",
      data: product,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
