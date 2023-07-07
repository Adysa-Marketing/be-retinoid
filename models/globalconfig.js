"use strict";

module.exports = (sequelize, DataTypes) => {
  const GlobalConfig = sequelize.define(
    "GlobalConfig",
    {
      websiteName: DataTypes.STRING,
      logo: DataTypes.STRING,
      banner: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      instagram: DataTypes.STRING,
      address: DataTypes.STRING,
      adminFee: DataTypes.BIGINT,
      footer: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    { paranoid: true }
  );
  return GlobalConfig;
};
