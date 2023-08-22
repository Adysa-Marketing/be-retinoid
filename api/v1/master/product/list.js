const {
  Product,
  ProductCategory,
  Agen,
  Stokis,
} = require("../../../../models");
const logger = require("../../../../libs/logger");
const Sequelize = require("sequelize");
const sanitizeHtml = require("sanitize-html");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;

    const schema = {
      keyword: "string|optional",
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

    const id =
      source.keyword?.length > 3
        ? source.keyword.substr(3, source.keyword.length - 1)
        : 0;
    const keycode = !isNaN(id) ? { id } : {};

    const keyword = source.keyword
      ? {
          [Op.or]: [
            {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn("lower", Sequelize.col("Product.name")),
                  Op.like,
                  "%" + source.keyword.toString().toLowerCase() + "%"
                ),
              ],
            },
            {
              id: !isNaN(source.keyword) ? parseInt(source.keyword) : 0,
            },
            {
              ...keycode,
            },
          ],
        }
      : {};

    const queryCategory = source.categoryId
      ? { categoryId: source.categoryId }
      : {};
    const where = {
      ...keyword,
      ...queryCategory,
    };

    logger.info({ source, where });

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await Product.count({
      where,
      include: {
        attributes: ["id", "name"],
        model: ProductCategory,
      },
    });

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

    Product.findAll({
      ...offsetLimit,
      attributes: ["id", "name", "amount", "description", "image", "stock"],
      where,
      include: {
        attributes: ["id", "name"],
        model: ProductCategory,
      },
      order: [["id", "DESC"]],
    })
      .then(async (response) => {
        response = JSON.parse(JSON.stringify(response));

        const data = await Promise.all(
          response.map(async (product) => {
            let discount = 0;
            // jika product category == bundle product. berikan diskon
            if (
              [1, 2].includes(product.ProductCategory.id) &&
              [3].includes(user.roleId)
            ) {
              discount =
                product.ProductCategory.id == 1
                  ? parseInt(user.profit) * 2
                  : parseInt(user.profit);
            }

            product.description = sanitizeHtml(product.description, {
              allowedTags: [],
              allowedAttributes: {},
            });

            return {
              discount,
              ...product,
            };
          })
        );
        return res.json({
          status: "success",
          data,
          totalData,
          totalPages,
        });
      })
      .catch((error) => {
        console.log("[!] Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
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
