"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      stock: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Product.associate = (models) => {
    Product.hasMany(models.TrSale, {
      foreignKey: "productId",
    });
    Product.hasMany(models.ATrSale, {
      foreignKey: "productId",
    });

    Product.belongsTo(models.ProductCategory, {
      foreignKey: {
        field: "categoryId",
      },
    });

    Product.belongsToMany(models.User, {
      through: models.AgenProduct,
      foreignKey: "productId",
    });
  };

  return Product;
};
