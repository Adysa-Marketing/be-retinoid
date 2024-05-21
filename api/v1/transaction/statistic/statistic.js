const env = process.env.NODE_ENV;
const config = require("../../../../config/core")[env];
const {
  AccountLevel,
  Agen,
  AgenProduct,
  ATrSale,
  Commission,
  Mutation,
  Package,
  PaymentType,
  Product,
  ProductCategory,
  Referral,
  Reward,
  RwStatus,
  Stokis,
  SponsorKey,
  TrReward,
  TrSale,
  TrStatus,
  TrStokis,
  User,
  WdStatus,
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
      attributes: ["id", "qty", "amount", "date", "productId", "createdAt"],
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
          const month = moment(item.createdAt)
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

        const dataProduct = await Product.findAll({
          attributes: ["id", "name"],
        });

        const data = dataProduct.map((item) => {
          let product = sales.filter((product) => product.productId == item.id);
          product = _.groupBy(product, "month");

          const dataProduct = labels.map((lb) => {
            const key = moment(lb, "MMMM").format("YYYYMM");
            const label = product[key];
            const count = label ? label.length : 0;
            return count;
          });

          return {
            name: item.name,
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

module.exports.ChartMember = (req, res) => {
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

    User.findAll({
      attributes: ["id", "name", "username", "accountLevelId", "createdAt"],
      where: {
        [Op.and]: {
          roleId: {
            [Op.in]: [4, 5],
          },
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      },
    })
      .then(async (users) => {
        users = JSON.parse(JSON.stringify(users));
        users = users.map((item) => {
          const month = moment(item.createdAt)
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

        const dataAccountLevel = await AccountLevel.findAll({
          attributes: ["id", "name"],
        });

        const data = dataAccountLevel.map((item) => {
          let user = users.filter((user) => user.accountLevelId == item.id);
          user = _.groupBy(user, "month");

          const dataUser = labels.map((lb) => {
            const key = moment(lb, "MMMM").format("YYYYMM");
            const label = user[key];
            const count = label ? label.length : 0;
            return count;
          });

          return {
            name: item.name,
            dataUser,
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
            data: item.dataUser,
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

// total user (admin, agen, member)
module.exports.User = async (req, res) => {
  try {
    const agen = await Agen.count({
      where: { statusId: 4 },
      include: {
        model: User,
        where: {
          roleId: 3,
          isActive: true,
        },
        required: true,
      },
    });

    const admin = await User.count({
      where: { roleId: 2 },
    });

    const member = await User.count({
      where: { roleId: 4 },
    });

    return res.json({
      status: "success",
      admin,
      agen,
      member,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// total new member by month
module.exports.NewMember = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      roleId: { [Op.in]: [3, 4] },
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };
    const member = await User.count({ where });
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

// // total member active
// module.exports.Member = async (req, res) => {
//   try {
//     const member = await User.count({ where: { roleId: 4, isActive: true } });

//     return res.json({
//       status: "success",
//       amount: member,
//     });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

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
      statusId: {
        [Op.in]: [4, 5],
      },
      ...queryAgen,
    };

    const trSale = await TrSale.count({ where });
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
module.exports.MonthlyMutation = async (req, res) => {
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    Mutation.findAll({ attributes: ["amount", "type"], where })
      .then((mutation) => {
        mutation = JSON.parse(JSON.stringify(mutation));
        const income = mutation
          .filter((item) => item.type == "Dana Masuk")
          .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
        const outcome = mutation
          .filter((item) => item.type == "Dana Keluar")
          .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
        const registration = mutation
          .filter((item) => item.type == "Registrasi")
          .reduce((prev, curr) => prev + parseInt(curr.amount), 0);

        return res.json({
          status: "success",
          income: income == 0 ? 1 : income,
          outcome: outcome == 0 ? 1 : outcome,
          registration: registration == 0 ? 1 : registration,
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

// // amount income
// module.exports.Mutation = async (req, res) => {
//   try {
//     Mutation.findAll({
//       attributes: ["amount", "type"],
//       // where: { type: "Dana Masuk" },
//     })
//       .then((mutation) => {
//         mutation = JSON.parse(JSON.stringify(mutation));
//         console.log("mutation :", mutation);
//         const income = mutation
//           .filter((item) => item.type == "Dana Masuk")
//           .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
//         const outcome = mutation
//           .filter((item) => item.type == "Dana Keluar")
//           .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
//         return res.json({
//           status: "success",
//           income,
//           outcome,
//         });
//       })
//       .catch((error) => {
//         console.log("[!]Error : ", error);
//         return res.status(400).json({
//           status: "error",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // amount monthly outcome
// module.exports.MonthlyOutcome = async (req, res) => {
//   try {
//     const startDate = moment().startOf("months").toDate();
//     const endDate = moment().endOf("months").toDate();
//     const where = {
//       type: "Dana Keluar",
//       createdAt: {
//         [Op.gte]: startDate,
//         [Op.lte]: endDate,
//       },
//     };

//     Mutation.findAll({ attributes: ["amount"], where, raw: true })
//       .then((mutation) => {
//         const amount = mutation.length
//           ? mutation.reduce((prev, curr) => {
//               return prev + parseInt(curr.amount);
//             }, 0)
//           : 0;
//         return res.json({
//           status: "success",
//           amount,
//         });
//       })
//       .catch((error) => {
//         console.log("[!]Error : ", error);
//         return res.status(400).json({
//           status: "error",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // amount income
// module.exports.Outcome = async (req, res) => {
//   try {
//     Mutation.findAll({
//       attributes: ["amount"],
//       where: { type: "Dana Keluar" },
//     })
//       .then((mutation) => {
//         const amount = mutation.length
//           ? mutation.reduce((prev, curr) => {
//               return prev + parseInt(curr.amount);
//             }, 0)
//           : 0;
//         return res.json({
//           status: "success",
//           amount,
//         });
//       })
//       .catch((error) => {
//         console.log("[!]Error : ", error);
//         return res.status(400).json({
//           status: "error",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

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

    const trStokis = await TrStokis.count({ where });
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
// module.exports.MonthlyIncomeTrStokis = async (req, res) => {
//   try {
//     const startDate = moment().startOf("months").toDate();
//     const endDate = moment().endOf("months").toDate();
//     const where = {
//       date: {
//         [Op.gte]: startDate,
//         [Op.lte]: endDate,
//       },
//       statusId: 4,
//     };

//     TrStokis.findAll({
//       attributes: ["amount"],
//       where,
//       raw: true,
//     })
//       .then((trStokis) => {
//         const amount = trStokis.length
//           ? trStokis.reduce((prev, curr) => {
//               return prev + parseInt(curr.amount);
//             }, 0)
//           : 0;
//         return res.json({
//           status: "success",
//           amount,
//         });
//       })
//       .catch((error) => {
//         console.log("[!]Error : ", error);
//         return res.status(400).json({
//           status: "error",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // amount all TrStokis
// module.exports.IncomeTrStokis = async (req, res) => {
//   try {
//     const where = {
//       statusId: 4,
//     };

//     TrStokis.findAll({
//       attributes: ["amount"],
//       where,
//       raw: true,
//     })
//       .then((trStokis) => {
//         const amount = trStokis.length
//           ? trStokis.reduce((prev, curr) => {
//               return prev + parseInt(curr.amount);
//             }, 0)
//           : 0;
//         return res.json({
//           status: "success",
//           amount,
//         });
//       })
//       .catch((error) => {
//         console.log("[!]Error : ", error);
//         return res.status(400).json({
//           status: "error",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

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
    const trReward = await TrReward.count({ where });
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
    const widhraw = await Widhraw.count({ where });
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
      attributes: ["paidAmount"],
      where,
      raw: true,
    })
      .then((wd) => {
        const amount = wd.length
          ? wd.reduce((prev, curr) => {
              return prev + parseInt(curr.paidAmount);
            }, 0)
          : 0;

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
    const atrSale = await ATrSale.count({
      where: {
        userId: user.id,
        statusId: {
          [Op.in]: [1, 3, 4, 5],
        },
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
// total ATrSale
module.exports.AgenProductItem = async (req, res) => {
  try {
    const user = req.user;
    const agenProduct = await AgenProduct.count({
      where: {
        userId: user.id,
      },
    });

    return res.json({
      status: "success",
      amount: agenProduct,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// amount monthly agen profit
module.exports.MonthlyAgenProfit = async (req, res) => {
  const user = req.user;
  try {
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      userId: user.id,
      statusId: {
        [Op.in]: [4, 5],
      },

      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    ATrSale.findAll({ attributes: ["profit"], where, raw: true })
      .then((sale) => {
        const profit = sale.length
          ? sale.reduce((prev, curr) => {
              return prev + parseInt(curr.profit);
            }, 0)
          : 0;
        return res.json({
          status: "success",
          amount: profit,
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

// amount Agen Profit
module.exports.AgenProfit = async (req, res) => {
  const user = req.user;
  try {
    ATrSale.findAll({
      attributes: ["profit"],
      where: {
        userId: user.id,
        statusId: {
          [Op.in]: [4, 5],
        },
      },
    })
      .then((sale) => {
        const profit = sale.length
          ? sale.reduce((prev, curr) => {
              return prev + parseInt(curr.profit);
            }, 0)
          : 0;
        return res.json({
          status: "success",
          amount: profit,
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

// // amount bonus
// module.exports.Bonus = async (req, res) => {
//   try {
//     const user = req.user;
//     const data = await User.findOne({
//       attributes: ["id", "name", "wallet"],
//       where: { id: user.id },
//       raw: true,
//     });

//     return res.json({
//       status: "success",
//       amount: parseInt(data.wallet),
//     });
//   } catch (error) {
//     console.log("[!]Error : ", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// amount monthly bonus
module.exports.MonthlyBonus = async (req, res) => {
  try {
    const user = req.user;
    const startDate = moment().startOf("months").toDate();
    const endDate = moment().endOf("months").toDate();
    const where = {
      userId: user.id,
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    await Commission.findAll({ attributes: ["amount"], where, raw: true })
      .then((comm) => {
        const amount = comm.length
          ? comm.reduce((prev, curr) => {
              return prev + parseInt(curr.amount);
            }, 0)
          : 0;

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
      attributes: ["paidAmount"],
      where: {
        userId: user.id,
        statusId: 5,
      },
      raw: true,
    })
      .then((wd) => {
        const amount = wd.length
          ? wd.reduce((prev, curr) => {
              return prev + parseInt(curr.paidAmount);
            }, 0)
          : 0;

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
module.exports.Referrals = async (req, res) => {
  try {
    const user = req.user;
    const reffrals = await Referral.count({
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
    const trReward = await TrReward.count({
      where: {
        userId: user.id,
        statusId: { [Op.in]: [1, 4, 5] },
      },
    });

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

// self info
module.exports.SelfInfo = async (req, res) => {
  try {
    const user = req.user;
    const info = await User.findOne({
      attributes: ["id", "point", "wallet", "kk"],
      where: { id: user.id },
    });
    return res.json({
      status: "success",
      point: info.point,
      wallet: info.wallet,
      kk: info.kk,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.HistoryReferral = async (req, res) => {
  try {
    const user = req.user;
    const sponsorKey = await SponsorKey.findOne({
      attributes: ["id", "userId", "key"],
      where: { userId: user.id },
    });

    await Referral.findAll({
      limit: 10,
      attributes: ["id", "date"],
      where: {
        sponsorId: sponsorKey.id,
      },
      include: [
        {
          attributes: ["id", "name", "email", "phone"],
          model: User, //downline
        },
      ],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((ref) => {
          ref.date = moment(ref.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...ref,
          };
        });

        return res.json({
          status: "success",
          data,
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

module.exports.HistoryWidhraw = async (req, res) => {
  try {
    const user = req.user;
    const queryMember = [3, 4].includes(user.roleId) ? { userId: user.id } : {};

    await Widhraw.findAll({
      limit: 10,
      attributes: ["id", "amount", "paidAmount", "createdAt", "updatedAt"],
      where: { ...queryMember },
      include: [
        {
          attributes: ["id", "name"],
          model: WdStatus,
        },
      ],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((wd) => {
          const code = wd.id.toString().padStart(config.maxFill, 0);
          wd.createdAt = moment(wd.createdAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          wd.updatedAt = moment(wd.updatedAt)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...wd,
            kode: `TRW${code}`,
          };
        });

        return res.json({
          status: "success",
          data,
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
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
// history agen sale
module.exports.HistoryAgenSale = async (req, res) => {
  const user = req.user;
  try {
    ATrSale.findAll({
      limit: 10,
      attributes: ["id", "name", "qty", "amount", "profit", "remark"],
      where: {
        userId: user.id,
      },
      include: [
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
        },
      ],
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

        res.status(200).json({
          status: "success",
          data,
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

module.exports.HistorySale = (req, res) => {
  try {
    TrSale.findAll({
      limit: 10,
      attributes: ["id", "amount", "discount", "paidAmount"],
      include: [
        {
          attributes: ["id", "name"],
          model: User,
        },
        {
          attributes: ["id", "name"],
          model: TrStatus,
        },
        {
          attributes: ["id", "name"],
          model: Product,
        },
      ],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((trS) => {
          const code = trS.id.toString().padStart(config.maxFill, 0);

          trS.date = moment(trS.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...trS,
            kode: `TRS${code}`,
          };
        });

        return res.json({
          status: "success",
          data,
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
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.HistoryReward = (req, res) => {
  try {
    TrReward.findAll({
      limit: 10,
      attributes: ["id", "date", "remark"],
      include: [
        {
          attributes: ["id", "name"],
          model: User,
        },
        {
          attributes: ["id", "name"],
          model: RwStatus,
        },
        {
          attributes: ["id", "name"],
          model: Reward,
        },
      ],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((trRw) => {
          const code = trRw.id.toString().padStart(config.maxFill, 0);
          trRw.date = moment(trRw.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...trRw,
            kode: `TRR${code}`,
          };
        });

        return res.json({
          status: "success",
          data,
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
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.HistoryStokis = (req, res) => {
  try {
    TrStokis.findAll({
      limit: 10,
      attributes: ["id", "amount", "date"],
      include: [
        {
          attributes: ["id", "name", "price"],
          model: Stokis,
        },
        {
          attributes: ["id", "name"],
          model: TrStatus,
        },
        {
          attributes: ["id", "username", "email", "phone"],
          model: User,
        },
      ],
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result = JSON.parse(JSON.stringify(result));

        const data = result.map((tr) => {
          const code = tr.id.toString().padStart(config.maxFill, 0);
          tr.date = moment(tr.date)
            .utc()
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");

          return {
            ...tr,
            kode: `TRS${code}`,
          };
        });

        return res.json({
          status: "success",
          data,
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
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
