"use strict";

module.exports = (sequelize, DataTypes) => {
  const Mutation = sequelize.define(
    "Mutation",
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Mutation.associate = (models) => {
    Mutation.belongsTo(models.TrSale, {
      foreignKey: {
        field: "saleId",
      },
    });
    Mutation.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
    Mutation.belongsTo(models.Widhraw, {
      foreignKey: {
        field: "widhrawId",
      },
    });
  };

  return Mutation;
};
