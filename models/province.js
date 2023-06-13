"use strict";

module.exports = (sequelize, DataTypes) => {
  const Province = sequelize.define(
    "Province",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timeZone: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    { paranoid: true }
  );

  Province.associate = (models) => {
    Province.belongsTo(models.Country, {
      foreignKey: {
        field: "countryId",
      },
    });

    Province.hasMany(models.User, {
      foreignKey: "provinceId",
    });
    Province.hasMany(models.District, {
      foreignKey: "provinceId",
    });
  };

  return Province;
};
