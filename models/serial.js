"use strict";

module.exports = (sequelize, DataTypes) => {
  const Serial = sequelize.define(
    "Serial",
    {
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        validate: {
          customValidator: (value) => {
            const enums = [1, 2]; //pending, actived // printed
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

  Serial.associate = (models) => {
    Serial.hasOne(models.User, {
      foreignKey: "serialId",
    });
  };

  return Serial;
};
