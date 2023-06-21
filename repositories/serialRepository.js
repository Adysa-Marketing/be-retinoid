const { Serial } = require("../models");

module.exports = {
  async findOneBy(query) {
    return Serial.findOne({
      attributes: ["id", "serial", "status"],
      where: query,
    });
  },

  async updateBySerial(serial) {
    return Serial.update(
      { status: 1 },
      {
        where: {
          serial,
        },
      }
    );
  },
};
