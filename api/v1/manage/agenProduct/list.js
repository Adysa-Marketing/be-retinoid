const { User, Product, ProductCategory } = require("../../../../models");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;

    const schema = {
      categoryId: "number|optional",
      rowsPerPage: [
        { type: "string", empty: "false" },
        { type: "number", empty: "false" },
      ],
      currentPage: "number|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const queryAgen = { id: user.id };
    const queryCategory = source.categoryId
      ? { categoryId: source.categoryId }
      : {};
    const where = {
      ...queryAgen,
    };

    // const includeParent = [
    //   {
    //     attributes: ["id", "name"],
    //     model: Product,
    //     include: {
    //       attributes: ["id", "name"],
    //       model: ProductCategory,
    //       where: {
    //         ...queryCategory,
    //       },
    //     },
    //   },
    // ];
    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const data = await User.findOne({
      attributes: ["id", "name"],
      where: { ...queryAgen },
      include: [
        {
          attributes: ["id", "name", "amount", "description", "image"],
          model: Product,
          through: {
            attributes: ["stock"],
          },
          where: { ...queryCategory },
          include: {
            attributes: ["id", "name"],
            model: ProductCategory,
          },
        },
      ],
    });
    const totalData = data && data.Products ? data.Products.length : 0;

    const totalPages =
      rowsPerPage !== "All"
        ? totalData
          ? totalData % rowsPerPage === 0
            ? parseInt(totalData / rowsPerPage)
            : parseInt(totalData / rowsPerPage) + 1
          : 0
        : 1;
    const offset = rowsPerPage !== "All" ? (currentPage - 1) * rowsPerPage : 0;
    const limit = rowsPerPage !== "All" ? rowsPerPage : totalData;
    const offsetLimit = rowsPerPage !== "All" ? { offset, limit } : {};
    await User.findOne({
      attributes: ["id", "name"],
      where: { ...queryAgen },
      include: [
        {
          offsetLimit,
          attributes: ["id", "name", "amount", "description", "image"],
          model: Product,
          through: {
            attributes: ["stock"],
          },
          where: { ...queryCategory },
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
        delete product.AgenProduct;
        return product;
      });
      return res.json({
        status: "success",
        data,
        totalData,
        totalPages,
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
