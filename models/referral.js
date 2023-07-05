"use strict";
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define(
    "Referral",
    {
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

  Referral.associate = (models) => {
    Referral.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });

    Referral.belongsTo(models.SponsorKey, {
      foreignKey: {
        field: "sponsorId",
      },
    });
  };

  return Referral;
};
