"use strict";

module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define(
    "Reward",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minFoot: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
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
