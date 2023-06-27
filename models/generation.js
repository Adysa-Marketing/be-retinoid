"use strict";

module.exports = (sequelize, DataTypes) => {
  const Generation = sequelize.define(
    "Generation",
    {
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Generation.associate = (models) => {
    Generation.belongsTo(models.User, {
      as: "Upline",
      foreignKey: {
        field: "userId",
      },
    });
    Generation.belongsTo(models.User, {
      as: "Downline",
      foreignKey: {
        field: "downlineId",
      },
    });
    Generation.belongsTo(models.CommissionLevel, {
      foreignKey: {
        field: "levelId",
      },
    });
  };

  return Generation;
};
