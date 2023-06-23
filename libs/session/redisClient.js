const env = process.env.NODE_ENV;
const config = require("../../config/redis")[env];

const redis = require("redis");
const { promiseAll } = require("bluebird");
promiseAll(redis);

const redisClient = redis.createClient(config);
redisClient.on("error", (err) => {
  console.log("Redis error : ", err);
});

redisClient.on("connect", () => {
  console.log("Connect to redis");
});

const close = () => {
  redisClient.close();
};

module.exports = {
  redisClient,
  close,
};
