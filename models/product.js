"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PAKET A",
        validate: {
          customValidator: (value) => {
            const enums = ["PAKET A", "PAKET B", "PAKET C"];
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
      description: DataTypes.STRING,
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
    Product.hasMany(models.Transaction, {
      foreignKey: "productId",
    });
  };

  return Product;
};
