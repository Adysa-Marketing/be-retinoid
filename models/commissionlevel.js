"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommissionLevel = sequelize.define(
    "CommissionLevel",
    {
      name: DataTypes.STRING,
      percent: DataTypes.INTEGER,
      level: DataTypes.INTEGER,
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
    CommissionLevel.hasMany(models.Generation, {
      foreignKey: "levelId",
    });

    // belongs to
    CommissionLevel.belongsTo(models.AccountLevel, {
      foreignKey: {
        field: "accountLevelId",
      },
    });
  };

  return CommissionLevel;
};
