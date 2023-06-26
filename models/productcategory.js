"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    "ProductCategory",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  ProductCategory.associate = (models) => {
    ProductCategory.hasMany(models.Product, {
      foreignKey: "categoryId",
    });
  };

  return ProductCategory;
};
