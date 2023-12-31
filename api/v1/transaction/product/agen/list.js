const env = process.env.NODE_ENV;
const config = require("../../../../../config/core")[env];
const {
  Product,
  ATrSale,
  PaymentType,
  TrStatus,
} = require("../../../../../models");
const logger = require("../../../../../libs/logger");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const source = req.body;
    const user = req.user;

    const schema = {
      keyword: "string|optional",
      statusId: "number|optional",
      categoryId: "number|optional",
      paymentTypeId: "number|optional",
      productId: "number|optional",
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
      source.keyword.length > 3
        ? source.keyword.substr(3, source.keyword.length - 1)
        : 0;
    const keycode = !isNaN(id) ? { id } : {};

    const keyword = source.keyword
      ? {
          [Op.or]: [
            {
              id: !isNaN(source.keyword) ? parseInt(source.keyword) : 0,
            },
            {
              ...keycode,
            },
          ],
        }
      : {};

    const startDate = moment(source.startDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();
    const endDate = moment(source.endDate, "YYYY-MM-DD")
      .startOf("days")
      .toDate();

    const dateRange =
      source.startDate && source.endDate
        ? {
            createdAt: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          }
        : {};

    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};
    const queryStatus = source.statusId ? { statusId: source.statusId } : {};
    const queryPaymentType = source.paymentTypeId
      ? { paymentTypeId: source.paymentTypeId }
      : {};
    const queryProduct = source.productId
      ? { productId: source.productId }
      : {};
    const queryCategory = source.categoryId
      ? { categoryId: source.categoryId }
      : {};

    const where = {
      ...keyword,
      ...dateRange,
      ...queryAgen,
      ...queryStatus,
      ...queryProduct,
      ...queryPaymentType,
    };

    const includeParent = [
      {
        attributes: ["id", "name"],
        model: TrStatus,
      },
      {
        attributes: ["id", "name"],
        model: PaymentType,
      },
      {
        attributes: ["id", "name", "amount"],
        model: Product,
        where: {
          ...queryCategory,
        },
      },
    ];

    logger.info(source);

    const rowsPerPage = source.rowsPerPage;
    const currentPage = source.currentPage;
    const totalData = await ATrSale.count({
      where,
      include: [...includeParent],
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

    ATrSale.findAll({
      ...offsetLimit,
      attributes: ["id", "name", "qty", "amount", "profit", "remark"],
      where,
      include: [...includeParent],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((aTrS) => {
          const code = aTrS.id.toString().padStart(config.maxFill, 0);

          aTrS.createdAt = moment(aTrS.createdAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...aTrS,
            kode: `ATS${code}`,
          };
        });

        return res.json({
          status: "success",
          data,
          totalData,
          totalPages,
        });
      })
      .catch((error) => {
        console.log("[!] Error : ", error);
        return res.status(500).json({
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
