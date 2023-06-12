"use strict";

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      status: {
        type: DataTypes.NUMBER,
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
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      proofImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fromBank: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trDate: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD"),
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Transaction.associate = (models) => {
    Transaction.belogsTo(models.Product, {
      foreignKey: "productId",
    });
    Transaction.belogsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    Transaction.belogsTo(models.Bank, {
      foreignKey: {
        field: "bankId",
      },
    });

    Transaction.hasMany(models.Mutation, {
      foreignKey: "trId",
    });
  };

  return Transaction;
};
