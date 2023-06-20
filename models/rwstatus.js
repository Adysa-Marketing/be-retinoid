"use strict";

module.exports = (sequelize, DataTypes) => {
  const RwStatus = sequelize.define(
    "RwStatus",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  RwStatus.associate = (models) => {
    RwStatus.hasMany(models.TrReward, {
      foreignKey: "statusId",
    });
  };

  return RwStatus;
};
