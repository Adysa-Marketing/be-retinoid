"use strict";

module.exports = (sequelize, DataTypes) => {
  const SubDistrict = sequelize.define(
    "SubDistrict",
    {
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
  };

  return SubDistrict;
};
