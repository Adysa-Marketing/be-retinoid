"use strict";

module.exports = (sequelize, DataTypes) => {
  const WdStatus = sequelize.define(
    "WdStatus",
    {
      name: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  WdStatus.associate = (models) => {
    WdStatus.hasMany(models.Widhraw, {
      foreignKey: "statusId",
    });
  };

  return WdStatus;
};
