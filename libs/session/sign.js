const env = process.env.NODE_ENV;
const config = require("../../config/redis")[env];
const crypto = require("crypto-js");

const { redisClient } = require("./redisClient");
const expirationTime = 30;

module.exports = async (user, sessionBy) => {
  const strings = JSON.stringify(user);
  const token = crypto.AES.encrypt(strings, config.secret)
    .toString()
    .replace(/\=/g, "")
    .replace(/\+/g, "_")
    .replace(/\//g, "_");

  const sessionByUserId = await new Promise((resolve, reject) =>
    redisClient.hget(
      `${sessionBy ? sessionBy : config.sessionName}SessionById`,
      user.id,
      (err, reply) => (err ? reject(err) : resolve(JSON.parse(reply)))
    )
  );
  const oTokens =
    sessionByUserId && sessionByUserId.tokens
      ? [...sessionByUserId.tokens, token]
      : [token];

  let tokens;
  if (oTokens.length > 1) {
    tokens = await Promise.all(
      oTokens.map(async (to) => {
        const user = await redisClient.getAsync(
          `${sessionBy ? sessionBy : config.sessionName}SessionByToken${to}`
        );

        if (user || to === token) return to;
      })
    ).filter((token) => token);
  } else tokens = oTokens;

  const data = {
    user,
    tokens,
  };

  redisClient.hset(
    `${sessionBy ? sessionBy : config.sessionName}SessionById`,
    user.id,
    JSON.stringify(data)
  );

  if (["monitoring", "monitoringdev"].includes(env)) {
    redisClient.set(
      `${sessionBy ? sessionBy : config.sessioName}SessionByToken${token}`,
      JSON.stringify(user)
    );
  } else {
    redisClient.setex(
      `${sessionBy ? sessionBy : config.sessionBy}SessionByToken${token}`,
      60 * 60 * expirationTime,
      JSON.stringify(user)
    );
  }

  return token;
};
