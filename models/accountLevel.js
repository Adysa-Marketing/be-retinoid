"use strict";

module.exports = (sequelize, DataTypes) => {
  const AccountLevel = sequelize.define(
    "AccountLevel",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  AccountLevel.associate = (models) => {
    AccountLevel.hasMany(models.CommissionLevel, {
      foreignKey: "accountLevelId",
    });
    AccountLevel.hasMany(models.User, {
      foreignKey: "accountLevelId",
    });
    AccountLevel.hasMany(models.Serial, {
      foreignKey: "accountLevelId",
    });
  };

  return AccountLevel;
};
