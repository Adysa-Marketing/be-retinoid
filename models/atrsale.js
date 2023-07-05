"use strict";

module.exports = (sequelize, DataTypes) => {
  const ATrSale = sequelize.define(
    "ATrSale",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      profit: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      image: DataTypes.STRING,
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
    ATrSale.belongsTo(models.PaymentType, {
      foreignKey: {
        field: "paymentTypeId",
      },
    });
    ATrSale.belongsTo(models.TrStatus, {
      foreignKey: {
        field: "statusId",
      },
    });
  };

  return ATrSale;
};
