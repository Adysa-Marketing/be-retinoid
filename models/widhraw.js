"use strict";

module.exports = (sequelize, DataTypes) => {
  const Widhraw = sequelize.define(
    "Widhraw",
    {
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        validate: {
          customValidator: (value) => {
            const enums = [0, 1, 2]; //pending, approve, reject
            if (!enums.indexOf(value)) {
              throw new Error("not a valid option");
            }
          },
        },
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
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Widhraw.associate = (models) => {
    Widhraw.belogsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
  };

  return Widhraw;
};
