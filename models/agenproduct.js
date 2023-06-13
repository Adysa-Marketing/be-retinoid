"use strict";

module.exports = (sequelize, DataTypes) => {
  const AgenProduct = sequelize.define(
    "AgenProduct",
    {
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remark: DataTypes.STRING,
    },
    { paranoid: true }
  );

  AgenProduct.associate = (models) => {};

  return AgenProduct;
};
