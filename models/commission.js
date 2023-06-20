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
        defaultValue: moment().format("YYYY-MM-DD"),
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
      foreinKey: {
        field: "userId",
      },
    });
    Commission.belongsTo(models.User, {
      as: "Downline",
      foreinKey: {
        field: "downlineId",
      },
    });
    Commission.belongsTo(models.CommissionLevel, {
      foreinKey: {
        field: "levelId",
      },
    });
  };

  return Commission;
};
