"use strict";

module.exports = (sequelize, DataTypes) => {
  const ATrSale = sequelize.define(
    "ATrSale",
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
          customValodator: (value) => {
            const enums = ["CASH", "TRANSFER"];
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      image: DataTypes.STRING,
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          customValodator: (value) => {
            const enums = [0, 1, 2]; //pending, approve, reject
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  ATrSale.associate = (models) => {
    ATrSale.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    ATrSale.belongsTo(models.Product, {
      foreignKey: {
        field: "productId",
      },
    });
  };

  return ATrSale;
};
