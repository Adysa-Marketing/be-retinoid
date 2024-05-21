"use strict";

module.exports = (sequelize, DataTypes) => {
  const Generation = sequelize.define(
    "Generation",
    {
      level: DataTypes.INTEGER,
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
  };

  return Generation;
};
