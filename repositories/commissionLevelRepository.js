const { CommissionLevel } = require("../models");

module.exports = {
  async findAll() {
    return CommissionLevel.findAll({
      attributes: ["id", "name", "precent"],
    });
  },

  async create(data) {
    return CommissionLevel.create(data);
  },

  async findOneBy(query) {
    return CommissionLevel.findOne({
      attributes: ["id", "name", "percent"],
      where: query,
    });
  },

  async update(data, id) {
    return CommissionLevel.update({ data }, { where: { id } });
  },

  async delete(id) {
    return CommissionLevel.destroy({ where: { id } });
  },
};
