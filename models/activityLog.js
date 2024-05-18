"use strict";

module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      activity: {
        type: DataTypes.STRING,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
  };

  return ActivityLog;
};
