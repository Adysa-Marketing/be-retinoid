"use strict";

module.exports = (sequelize, DataTypes) => {
  const Stokis = sequelize.define(
    "Stokis",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      discount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      agenDiscount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Stokis.associate = (models) => {
    Stokis.hasMany(models.Agen, {
      foreignKey: "stokisId",
    });
    Stokis.hasMany(models.TrStokis, {
      foreignKey: "stokisId",
    });
  };

  return Stokis;
};
