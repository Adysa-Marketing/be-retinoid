"use strict";

module.exports = (sequelize, DataTypes) => {
  const SponsorKey = sequelize.define(
    "SponsorKey",
    {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  SponsorKey.associate = (models) => {
    SponsorKey.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });

    SponsorKey.hasOne(models.User, {
      foreignKey: "sponsorId",
    });

    SponsorKey.hasMany(models.Referral, {
      foreignKey: "sponsorId",
    });
  };

  return SponsorKey;
};
