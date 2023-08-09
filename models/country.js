"use strict";

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "Country",
    {
      kode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    { paranoid: true }
  );

  Country.associate = (models) => {
    Country.hasMany(models.User, {
      foreignKey: "countryId",
    });
    Country.hasMany(models.TrStokis, {
      foreignKey: "countryId",
    });
    Country.hasMany(models.Province, {
      foreignKey: "countryId",
    });
  };

  return Country;
};
