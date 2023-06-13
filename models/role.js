"use strict";

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreinKey: "roleId",
    });
  };

  return Role;
};
