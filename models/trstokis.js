"use strict";

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const TrStokis = sequelize.define(
    "TrStokis",
    {
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      kk: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageKtp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      fromBank: DataTypes.STRING,
      accountName: DataTypes.STRING,
      date: {
        type: DataTypes.DATE,
        defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      address: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  TrStokis.associate = (models) => {
    TrStokis.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    TrStokis.belongsTo(models.Stokis, {
      foreignKey: {
        field: "stokisId",
      },
    });
    TrStokis.belongsTo(models.Bank, {
      foreignKey: {
        field: "bankId",
      },
    });
    TrStokis.belongsTo(models.PaymentType, {
      foreignKey: {
        field: "paymentTypeId",
      },
    });
    TrStokis.belongsTo(models.TrStatus, {
      foreignKey: {
        field: "statusId",
      },
    });
    TrStokis.belongsTo(models.Province, {
      foreignKey: {
        field: "provinceId",
      },
    });
    TrStokis.belongsTo(models.District, {
      foreignKey: {
        field: "districtId",
      },
    });
    TrStokis.belongsTo(models.SubDistrict, {
      foreignKey: {
        field: "subDistrictId",
      },
    });

    TrStokis.hasOne(models.Mutation, {
      foreignKey: "trStokisId",
    });
  };

  return TrStokis;
};
