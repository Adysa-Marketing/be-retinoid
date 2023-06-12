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
      status: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defauleValue: 0,
        validate: {
          customValidator: (value) => {
            const enums = [0, 1, 2]; //pending, approve, reject
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
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
  };

  return TrReward;
};
