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
    TrSale.belongsTo(models.PaymentType, {
      foreignKey: {
        field: "paymentTypeId",
      },
    });
    TrSale.belongsTo(models.TrStatus, {
      foreignKey: {
        field: "statusId",
      },
    });

    TrSale.hasMany(models.Mutation, {
      foreignKey: "saleId",
    });
  };

  return TrSale;
};
