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
      point: DataTypes.INTEGER,
      sponsorKey: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      wallet: DataTypes.INTEGER,
      verCode: DataTypes.STRING,
      address: DataTypes.STRING,
      kodepos: DataTypes.STRING,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      remark: DataTypes.STRING,
    },
    {
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["sponsorKey"],
        },
      ],
    }
  );

  User.associate = (models) => {
    // belongsTo
    User.belongsTo(models.Role, {
      foreignKey: {
        field: "roleId",
      },
    });
    User.belongsTo(models.Serial, {
      foreignKey: {
        field: "serialId",
      },
    });
    User.belongsTo(models.Country, {
      foreignKey: {
        field: "countryId",
      },
    });
    User.belongsTo(models.Province, {
      foreignKey: {
        field: "provinceId",
      },
    });
    User.belongsTo(models.District, {
      foreignKey: {
        field: "districtId",
      },
    });
    User.belongsTo(models.SubDistrict, {
      foreignKey: {
        field: "subDistrictId",
      },
    });

    // belongsToMany
    User.belongsToMany(models.Product, {
      through: models.AgenProduct,
      foreignKey: "userId",
    });

    // has Many
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
    User.hasMany(models.TrSale, {
      foreignKey: "userId",
    });
    User.hasMany(models.Mutation, {
      foreignKey: "userId",
    });
    User.hasMany(models.TrReward, {
      foreignKey: "userId",
    });
    User.hasMany(models.ATrSale, {
      foreignKey: "userId",
    });
    User.hasMany(models.TrStokis, {
      foreignKey: "userId",
    });

    // hasOne
    User.hasOne(models.Testimonial, {
      foreignKey: "userId",
    });
    User.hasOne(models.Agen, {
      foreignKey: "userId",
    });
  };

  return User;
};
