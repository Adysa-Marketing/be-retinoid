const { User } = require("../models");

module.exports = {
  async create(data) {
    return User.create(data);
  },
};
