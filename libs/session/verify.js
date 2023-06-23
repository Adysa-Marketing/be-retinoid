const env = process.env.NODE_ENV;
const config = require("../../config/redis")[env];

const { redisClient } = require("./redisClient");
const expirationTime = 30;

module.exports = async (token, callback) => {
  if (token) {
    redisClient.get(
      `${config.sessionName}SessionByToken${token}`,
      (err, reply) => {
        if (err || !reply) {
          callback("Invalid token", null);
        } else {
          const data = JSON.parse(reply);
          redisClient.expire(
            `${config.sessionName}SessionByToken${token}`,
            60 * expirationTime
          );
          callback(null, data);
        }
      }
    );
  } else {
    callback("Invalid token", null);
  }
};
