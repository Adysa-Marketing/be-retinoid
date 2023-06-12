"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
      },
      gender: {
        type: DataTypes.STRING,
        defaultValue: "Male",
        validate: {
          customValidator: (value) => {
            const enums = ["Male", "Female"];
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      image: DataTypes.STRING,
      point: DataTypes.NUMBER,
      sponsorKey: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      wallet: DataTypes.NUMBER,
      verCode: DataTypes.STRING,
      address: DataTypes.STRING,
      kodepos: DataTypes.STRING,
      isActive: {
        type: DataTypes.BOOLEAM,
        defaultValue: true,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
      indexes: [
        {
          unique: true,
          field: ["sponsorKey"],
        },
      ],
    }
  );

  User.associate = (models) => {
    User.belogsTo(models.Role, {
      foreignKey: {
        field: "roleId",
      },
    });
    User.belogsTo(models.Serial, {
      foreignKey: {
        field: "serialId",
      },
    });
    User.belogsTo(models.Country, {
      foreignKey: {
        field: "countryId",
      },
    });
    User.belogsTo(models.Province, {
      foreignKey: {
        field: "provinceId",
      },
    });
    User.belogsTo(models.District, {
      foreignKey: {
        field: "districtId",
      },
    });

    //
    User.hasMany(models.Referral, {
      foreignKey: "userId",
    });
    User.hasMany(models.Referral, {
      foreignKey: "referredId",
    });
    User.hasMany(models.Commission, {
      foreignKey: "userId",
    });
    User.hasMany(models.Commission, {
      foreignKey: "downlineId",
    });
    User.hasMany(models.Widhraw, {
      foreignKey: "userId",
    });
    User.hasMany(models.Transaction, {
      foreignKey: "userId",
    });
    User.hasMany(models.Mutation, {
      foreignKey: "userId",
    });
    User.hasMany(models.TrReward, {
      foreignKey: "userId",
    });

    User.hasOne(models.Testimonial, {
      foreignKey: "userId",
    });
  };

  return User;
};
