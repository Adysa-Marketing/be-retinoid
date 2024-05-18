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
      foreign: "accountLevelId",
    });
    AccountLevel.hasMany(models.User, {
      foreign: "accountLevelId",
    });
    AccountLevel.hasMany(models.Serial, {
      foreign: "accountLevelId",
    });
  };

  return AccountLevel;
};
