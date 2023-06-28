"use strict";

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Agen = sequelize.define(
    "Agen",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dateApproved: DataTypes.DATE,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Agen.associate = (models) => {
    Agen.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    Agen.belongsTo(models.Stokis, {
      foreignKey: {
        field: "stokisId",
      },
    });
    Agen.belongsTo(models.AgenStatus, {
      foreignKey: {
        field: "statusId",
      },
    });
  };

  return Agen;
};
