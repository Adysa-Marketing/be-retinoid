"use strict";

module.exports = (sequelize, DataTypes) => {
  const PaymentType = sequelize.define(
    "PaymentType",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  PaymentType.associate = (models) => {
    PaymentType.hasMany(models.TrSale, {
      foreignKey: "paymentTypeId",
    });
    PaymentType.hasMany(models.TrStokis, {
      foreignKey: "paymentTypeId",
    });
    PaymentType.hasMany(models.ATrSale, {
      foreignKey: "paymentTypeId",
    });
  };

  return PaymentType;
};
