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
    Bank.hasMany(models.Transaction, {
      foreignKey: "bankId",
    });
  };
  return Bank;
};
