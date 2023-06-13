"use strict";

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const TrSale = sequelize.define(
    "TrSale",
    {
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          customValidator: (value) => {
            const enums = ["CASH", "TRANSFER"];
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          customValidator: (value) => {
            const enums = [0, 1, 2]; //pending, approve, reject
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      image: DataTypes.STRING,
      fromBank: DataTypes.STRING,
      accountName: DataTypes.STRING,
      date: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD"),
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  TrSale.associate = (models) => {
    TrSale.belongsTo(models.Product, {
      foreignKey: "productId",
    });
    TrSale.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    TrSale.belongsTo(models.Bank, {
      foreignKey: {
        field: "bankId",
      },
    });

    TrSale.hasMany(models.Mutation, {
      foreignKey: "saleId",
    });
  };

  return TrSale;
};
