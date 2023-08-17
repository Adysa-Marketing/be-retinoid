const env = process.env.NODE_ENV;
const config = require("../config/core")[env];
const logger = require("./logger");

const axios = require("axios");

module.exports.Send = (payloadData) => {
  return new Promise((resolve, reject) => {
    const headers = {
      token: config.token,
    };
    logger.info({ sending: payloadData, headers });
    axios
      .post(`${config.apiBot}/api/send-chat`, payloadData, { headers })
      .then((res) => {
        logger.info({ received: res.data.data });
        resolve(res.data.data);
      })
      .catch((err) => {
        logger.info(err);
        reject(err);
      });
  });
};
