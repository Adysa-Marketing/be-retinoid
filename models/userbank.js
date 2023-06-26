"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserBank = sequelize.define(
    "UserBank",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      noRekening: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  UserBank.associate = (models) => {
    UserBank.belongsTo(models.User, {
      foreignKey: "userId",
    });
  };
  return UserBank;
};
