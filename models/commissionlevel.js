"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommissionLevel = sequelize.define(
    "CommissionLevel",
    {
      name: DataTypes.STRING,
      percent: DataTypes.INTEGER,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  CommissionLevel.associate = (models) => {
    CommissionLevel.hasMany(models.Commission, {
      foreignKey: "levelId",
    });
  };

  return CommissionLevel;
};
