"use strict";

module.exports = (sequelize, DataTypes) => {
  const TrStatus = sequelize.define(
    "TrStatus",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  TrStatus.associate = (models) => {
    TrStatus.hasMany(models.TrSale, {
      foreignKey: "statusId",
    });
    TrStatus.hasMany(models.TrStokis, {
      foreignKey: "statusId",
    });
    TrStatus.hasMany(models.ATrSale, {
      foreignKey: "statusId",
    });
  };
  return TrStatus;
};
