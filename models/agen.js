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
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          customValidator: (value) => {
            const enums = [0, 1, 2]; //pending, active, disabled
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
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
  };

  return Agen;
};
