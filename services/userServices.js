const userRepository = require("../repositories/userRepository");
const serialRepository = require("../repositories/serialRepository");
const commissionLevelRepository = require('../repositories/commissionLevelRepository')

const logger = require("../../libs/logger");
const db = require("../../models");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

module.exports = {
  async createUser(data) {
    const transaction = await db.sequelize.transaction({ autocommit: false });

    try {
      const password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(2));
      const sponsorKey = cryptoString({ length: 10, type: "base64" });
      const { countryId, provinceId, districtId, subDistrictId } = data;

      // check Serial
      const serial = await serialRepository.findOneBy({
        serial: data.serial,
        status: 0,
      });

      if (!serial) {
        throw new Error({
          message: "Kode Serial sudah pernah digunakan",
        });
      }

      const payload = {
        name: data.name,
        username: data.username,
        email: data.email,
        password,
        phone: data.phone,
        sponsorKey,
        roleId: 4,
        serialId: serial.id,
        countryId: countryId ? countryId : 1,
        provinceId: provinceId ? provinceId : null,
        districtId: districtId ? districtId : null,
        subDistrictId: subDistrictId ? subDistrictId : null,
      };

      logger.info({ data, payload });
      await userRepository.create(payload, { transaction });
      await serialRepository.updateBySerial(data.serial, { transaction });

      // create commission
      const commissionLevel = await commissionLevelRepository.findAll()
      
      // end commission
      transaction.commit();
      return "Registrasi Berhasil";
    } catch (error) {
      transaction.rollback();
      throw new Error(error);
    }
  },
};
