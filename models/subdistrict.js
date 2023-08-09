"use strict";

module.exports = (sequelize, DataTypes) => {
  const SubDistrict = sequelize.define(
    "SubDistrict",
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

  SubDistrict.associate = (models) => {
    SubDistrict.belongsTo(models.District, {
      foreignKey: {
        field: "districtId",
      },
    });

    SubDistrict.hasMany(models.User, {
      foreignKey: "subDistrictId",
    });
    SubDistrict.hasMany(models.TrStokis, {
      foreignKey: "subDistrictId",
    });
  };

  return SubDistrict;
};
