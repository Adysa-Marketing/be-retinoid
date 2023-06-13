"use strict";

module.exports = (sequelize, DataTypes) => {
  const Testimonial = sequelize.define(
    "Testimonial",
    {
      rating: DataTypes.STRING,
      testimonial: DataTypes.STRING,
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );

  Testimonial.associate = (models) => {
    Testimonial.belongsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
  };

  return Testimonial;
};
