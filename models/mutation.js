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
    Mutation.belogsTo(models.Transaction, {
      foreignKey: {
        field: "trId",
      },
    });
    Mutation.belogsTo(models.user, {
      foreignKey: {
        field: "userId",
      },
    });
  };

  return Mutation;
};
