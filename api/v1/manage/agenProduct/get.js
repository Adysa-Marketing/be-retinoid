const { User, Product, ProductCategory } = require("../../../../models");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const user = req.user;
  try {
    const schema = {
      productId: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const productId = req.params.productId;
    const queryAgen = { id: user.id };

    let data = await User.findOne({
      attributes: ["id", "name"],
      where: { ...queryAgen },
      include: [
        {
          attributes: ["id", "name", "amount", "description", "image"],
          model: Product,
          through: {
            attributes: ["stock"],
          },
          where: { id: productId },
          include: {
            attributes: ["id", "name"],
            model: ProductCategory,
          },
        },
      ],
    });

    if (!data)
      return res.status(404).json({
        status: "error",
        message: "Data Produk Agen tidak ditemukan",
      });

    data = JSON.parse(JSON.stringify(data));
    data = data.Products[0];
    data.stock = data.AgenProduct.stock;
    delete data.AgenProduct;

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
