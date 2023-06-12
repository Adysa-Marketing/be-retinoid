"use strict";

module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define(
    "Reward",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      point: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      image: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Reward.associate = (models) => {
    Reward.hasMany(models.TrReward, {
      foreignKey: "rewardId",
    });
  };

  return Reward;
};
