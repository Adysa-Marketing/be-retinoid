"use strict";

module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "Package",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Bronze",
        validate: {
          customValidator: (value) => {
            const enums = ["Bronze", "Silver", "Gold"];
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  return Package;
};
