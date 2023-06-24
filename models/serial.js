"use strict";

module.exports = (sequelize, DataTypes) => {
  const Serial = sequelize.define(
    "Serial",
    {
      serial: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          customValidator: (value) => {
            const enums = [0, 1]; //pending, actived // printed
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Serial.associatte = (models) => {
    Serial.hasOne(models.User, {
      foreignKey: "serialId",
    });
  };

  return Serial;
};
