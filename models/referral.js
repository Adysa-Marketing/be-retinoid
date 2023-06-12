"use strict";
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define(
    "Referral",
    {
      referralData: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD"),
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Referral.associate = (models) => {
    Referral.belongsTo(models.User, {
      as: "Downline",
      foreignKey: {
        field: "userId",
      },
    });

    Referral.belongsTo(models.User, {
      as: "Upline",
      foreignKey: {
        field: "referredId",
      },
    });
  };

  return Referral;
};
