const {
  Agen,
  ATrSale,
  Commission,
  Mutation,
  Package,
  Product,
  Refferal,
  Stokis,
  TrReward,
  TrSale,
  TrStokis,
  User,
  Widhraw,
} = require("../../../../models");

const Sequelize = require("sequelize");
const moment = require("moment");
const Op = Sequelize.Op;
const _ = require("lodash");

// statistik sell
module.exports.ChartSales = (req, res) => {
  try {
    const source = req.query;

    const startDate = moment().startOf("years").toDate();
    const endDate = moment().endOf("years").toDate();
    const formatDate =
      source.byView === "day"
        ? "YYYYMMDD"
        : source.byView === "month"
        ? "YYYYMM"
        : "YYYY";

    TrSale.findAll({
      attributes: ["id", "qty", "amount", "date", "createdAt"],
      include: {
        attributes: ["id", "name", "categoryId"],
        model: Product,
        include: {
          attributes: ["id", "name"],
          model: ProductCategory,
          required: true,
        },
      },
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    })
      .then(async (sales) => {
        sales = JSON.parse(JSON.stringify(sales));
        sales = sales.map((item) => {
          const month = moment(item.date)
            .utc()
            .add(7, "hours")
            .format(formatDate);
          return {
            ...item,
            month,
          };
        });

        let labels = moment
          .monthsShort()
          .map((item) => moment().month(item).format("MMMM"));

        const data = sales.map((item) => {
          let product = _.groupBy(item, "month");
          const dataProduct = labels.map((lb) => {
            const key = moment(lb, "MMMM").format("YYYYMM");
            const label = product[key];
            const count = label ? label.length : 0;
            return count;
          });

          return {
            name: product.name,
            dataProduct,
          };
        });

        const color = [
          "primary",
          "secondary",
          "info",
          "success",
          "warning",
          "error",
          "light",
          "dark",
        ];

        const datasets = data.map((item) => {
          return {
            label: item.name,
            color: _.sample(color),
            data: item.dataProduct,
          };
        });

        return res.json({
          status: "success",
          data: {
            labels,
            datasets,
          },
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total product
module.exports.Product = async (req, res) => {
  try {
    const product = await Product.count();

    return res.json({
      status: "success",
      amount: product,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total agen active
module.exports.Agen = async (req, res) => {
  try {
    const agen = await Agen.count({
      where: { statusId: 4 },
      include: {
        model: User,
        where: {
          role: 4,
          isActive: true,
        },
        required: true,
      },
    });

    return res.json({
      status: "success",
      amount: agen,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total member active
module.exports.Member = async (req, res) => {
  try {
    const member = await User.count({ where: { roleId: 4, isActive: true } });

    return res.json({
      status: "success",
      amount: member,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total package
module.exports.Package = async (req, res) => {
  try {
    const package = await Package.count();
    return res.json({
      status: "success",
      amount: package,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total type stokis
module.exports.Stokis = async (req, res) => {
  try {
    const stokis = await Stokis.count();
    return res.json({
      status: "success",
      amount: stokis,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total monthly TrSale
module.exports.TrSale = async (req, res) => {
  try {
    const user = req.user;
    const queryAgen = [3].includes(user.roleId) ? { userId: user.id } : {};
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      ...queryAgen,
    };

    const trSale = await TrSale.count(where);
    return res.json({
      status: "success",
      amount: trSale,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount monthly income
module.exports.MonthlyIncome = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    Mutation.findAll({ attributes: ["id", "amount"], where, raw: true })
      .then((mutation) => {
        const amount = mutation.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });
        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount income
module.exports.Income = async (req, res) => {
  try {
    Mutation.findAll({
      attributes: ["id", "amount", "qty"],
      where: {
        statusId: {
          [Op.in]: [4, 5],
        },
      },
      raw: true,
    })
      .then((mutation) => {
        const amount = mutation.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });
        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total monthly TrStokis
module.exports.TrStokis = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    const trStokis = await TrStokis.count(where);
    return res.json({
      status: "success",
      amount: trStokis,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount monthly TrStokis
module.exports.MonthlyIncomeTrStokis = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      statusId: 4,
    };

    TrStokis.findAll({
      attributes: ["id", "amount", "statusId"],
      where,
      raw: true,
    })
      .then((trStokis) => {
        const amount = trStokis.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });
        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount all TrStokis
module.exports.IncomeTrStokis = async (req, res) => {
  try {
    const where = {
      statusId: 4,
    };

    TrStokis.findAll({
      attributes: ["id", "amount", "statusId"],
      where,
      raw: true,
    })
      .then((trStokis) => {
        const amount = trStokis.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });
        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total monthly req reward
module.exports.MonthlyTrReward = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };
    const trReward = await TrReward.count(where);
    return res.json({
      status: "success",
      amount: trReward,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total monthly req widhraw
module.exports.MonthlyWd = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };
    const widhraw = await Widhraw.count(where);
    return res.json({
      status: "success",
      amount: widhraw,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount monthly spending wd
module.exports.MonthlySpendingWd = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      statusId: 5,
    };
    Widhraw.findAll({
      attributes: ["id", "amount", "statusId"],
      where,
      raw: true,
    })
      .then((wd) => {
        const amount = wd.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });

        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Role 3 / 4

// total ATrSale
module.exports.ATrSale = async (req, res) => {
  try {
    const user = req.user;
    const atrSale = await TrSale.count({
      where: {
        userId: user.id,
      },
    });

    return res.json({
      status: "success",
      amount: atrSale,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount bonus
module.exports.Bonus = async (req, res) => {
  try {
    const user = req.user;
    const data = await User.findOne({
      attributes: ["id", "name", "wallet"],
      where: { id: user.id },
      raw: true,
    });

    return res.json({
      status: "success",
      amount: data.wallet,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount monthly bonus
module.exports.MonthlyBonus = async (req, res) => {
  try {
    const user = req.user;
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      id: user.id,
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    await Commission.findAll({ where, raw: true })
      .then((comm) => {
        const amount = comm.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });

        return res.json({
          message: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount widhraw success
module.exports.SuccessWidhraw = async (req, res) => {
  try {
    const user = req.user;
    Widhraw.findAll({
      where: {
        userId: user.id,
        statusId: 5,
      },
      raw: true,
    })
      .then((wd) => {
        const amount = wd.reduce((prev, curr) => {
          return parseInt(prev.amount) + parseInt(curr.amount);
        });

        return res.json({
          status: "success",
          amount,
        });
      })
      .catch((error) => {
        console.log("[!]Error : ", error);
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total reffreal
module.exports.Refferals = async (req, res) => {
  try {
    const user = req.user;
    const reffrals = await Refferal.count({
      where: {
        sponsorId: user.sponsorId,
      },
    });

    return res.json({
      status: "success",
      amount: reffrals,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total TrReward
module.exports.TrReward = async (req, res) => {
  try {
    const user = req.user;
    const trReward = await TrReward.count({ userId: user.id });
    return res.json({
      status: "success",
      amount: trReward,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
