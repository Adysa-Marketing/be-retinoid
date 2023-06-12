"use strict";

module.exports = (sequelize, DataTypes) => {
  const Testimonial = sequelize.define(
    "testimonial",
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
    Testimonial.belogsTo(models.User, {
      foreignKey: {
        field: "userId",
      },
    });
  };

  return Testimonial;
};
