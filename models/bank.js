"use strict";

module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define(
    "Bank",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      noRekening: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Bank.associate = (models) => {
    Bank.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });

    Bank.hasMany(models.TrSale, {
      foreignKey: "bankId",
    });
    Bank.hasMany(models.TrStokis, {
      foreignKey: "bankId",
    });
  };
  return Bank;
};
