"use strict";

module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define(
    "District",
    {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  District.associate = (models) => {
    District.belongsTo(models.Province, {
      foreignKey: {
        field: "provinceId",
      },
    });

    District.hasMany(models.User, {
      foreignKey: "districtId",
    });
    District.hasMany(models.TrStokis, {
      foreignKey: "districtId",
    });
    District.hasMany(models.SubDistrict, {
      foreignKey: "districtId",
    });
  };

  return District;
};
