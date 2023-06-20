"use strict";

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const TrReward = sequelize.define(
    "TrReward",
    {
      date: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD"),
      },
      imageKtp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    { paranoid: true }
  );

  TrReward.associate = (models) => {
    TrReward.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    TrReward.belongsTo(models.Reward, {
      foreignKey: {
        field: "rewardId",
      },
    });
    TrReward.belongsTo(models.RwStatus, {
      foreignKey: {
        field: "statusId",
      },
    });
  };

  return TrReward;
};
