const { User, Product, ProductCategory } = require("../../../../models");

module.exports = async (req, res) => {
  try {
    const user = req.user;
    await User.findOne({
      attributes: ["id", "name"],
      where: { id: user.id },
      include: [
        {
          attributes: ["id", "name", "amount"],
          model: Product,
          through: {
            attributes: ["stock"],
          },
          include: {
            attributes: ["id", "name"],
            model: ProductCategory,
          },
        },
      ],
    }).then((user) => {
      user = JSON.parse(JSON.stringify(user));
      user = user && user.Products ? user.Products : [];

      const data = user.map((product) => {
        product.stock = product.AgenProduct.stock;
        product.category = product.ProductCategory.name;

        delete product.AgenProduct;
        delete product.ProductCategory;
        return product;
      });
      return res.json({
        status: "success",
        data,
      });
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
