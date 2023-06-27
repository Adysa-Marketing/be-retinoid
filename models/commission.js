"use strict";
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Commission = sequelize.define(
    "Commission",
    {
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Commission.associate = (models) => {
    Commission.belongsTo(models.User, {
      as: "Upline",
      foreignKey: {
        field: "userId",
      },
    });
    Commission.belongsTo(models.User, {
      as: "Downline",
      foreignKey: {
        field: "downlineId",
      },
    });
    Commission.belongsTo(models.CommissionLevel, {
      foreignKey: {
        field: "levelId",
      },
    });
  };

  return Commission;
};
