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
      commissionData: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD"),
      },
      commissionLevel: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Commission.associate = (models) => {
    Commission.belosTo(models.User, {
      as: "Upline",
      foreinKey: {
        field: "userId",
      },
    });
    Commission.belosTo(models.User, {
      as: "Downline",
      foreinKey: {
        field: "downlineId",
      },
    });
  };

  return Commission;
};
