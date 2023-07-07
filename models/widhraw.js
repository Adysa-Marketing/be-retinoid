"use strict";

module.exports = (sequelize, DataTypes) => {
  const Widhraw = sequelize.define(
    "Widhraw",
    {
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      paidAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      noRekening: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: DataTypes.STRING,
      imageKtp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Widhraw.associate = (models) => {
    Widhraw.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    Widhraw.belongsTo(models.WdStatus, {
      foreignKey: {
        field: "statusId",
      },
    });

    Widhraw.hasOne(models.Mutation, {
      foreignKey: "widhrawId",
    });
  };

  return Widhraw;
};
