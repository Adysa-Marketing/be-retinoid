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
      attributes: ["id", "name", "amount", "description", "stock", "remark"],
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

    if ([1].includes(product.ProductCategory.id) && [3].includes(user.roleId)) {
      const agen = await Agen.findOne({
        attributes: ["id", "name"],
        where: { userId: user.id },
        include: {
          attributes: ["id", "agenDiscount"],
          model: Stokis,
        },
        raw: true,
      });

      product.discount = agen.Stokis.agenDiscount;
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
