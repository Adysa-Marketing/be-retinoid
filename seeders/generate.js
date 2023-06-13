require("dotenv").config({ path: "../.env" });

const provinces = require("./province");
const districts = require("./region/kabupaten.json");
const subDistricts = require("./region/kecamatan.json");

const { Country, Province, District, SubDistrict } = require("../models");
const db = require("../models");

function generateCountry() {
  Country.create({ kode: "ID", name: "INDONESIA" })
    .then((result) => process.exit(0))
    .catch((err) => {
      console.log(err);
      process.exit(0);
    });
}

async function generateDistrict() {
  const transaction = await db.sequelize.transaction({ autocommit: false });

  Promise.all(
    provinces.map(async (province) => {
      // create province
      const prov = await Province.create(
        {
          name: province.name,
          key: province.id,
          timeZone: province.timeZone,
          countryId: 1,
        },
        { transaction }
      );

      const id = province.id;
      const dataDistrict = districts
        .filter((dist) => {
          const districtId = dist.id.slice(0, 2);
          return districtId === id;
        })
        .map((dist) => {
          return {
            key: dist.id,
            provinceId: prov.id,
            name: dist.nama,
          };
        });
      await District.bulkCreate(dataDistrict, { transaction });
    })
  )
    .then((result) => {
      transaction.commit();
      console.log({ result });
    })
    .catch((err) => {
      transaction.rollback();
      console.log(err);
    });
}

async function generateSubDistrict() {
  const transaction = await db.sequelize.transaction({ autocommit: false });
  const districts = await District.findAll({ attributes: ["id", "key"] });
  Promise.all(
    // create district
    districts.map(async (district) => {
      district = JSON.parse(JSON.stringify(district));
      const subDistrict = subDistricts
        .filter((subDist) => {
          const subDistrictId = subDist.id.slice(0, 4);
          return subDistrictId === district.key;
        })
        .map((subDist) => {
          return {
            key: subDist.id,
            districtId: district.id,
            name: subDist.nama,
          };
        });

      console.log("district : ", subDistrict)
      // create subdistrict
      await SubDistrict.bulkCreate(subDistrict, { transaction });
    })
  )
    .then((result) => {
      transaction.commit();
      console.log({ result });
    })
    .catch((err) => {
      transaction.rollback();
      console.log(err);
    });
}

// generateCountry();
// generateDistrict();
// generateSubDistrict();
