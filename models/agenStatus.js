"use strict";

module.exports = (sequelize, DataTypes) => {
  const AgenStatus = sequelize.define(
    "AgenStatus",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  AgenStatus.associate = (models) => {
    AgenStatus.hasMany(models.Agen, {
      foreignKey: "statusId",
    });
  };
  return AgenStatus;
};
