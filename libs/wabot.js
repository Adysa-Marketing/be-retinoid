const env = process.env.NODE_ENV;
const config = require("../config/core")[env];
const logger = require("./logger");
const { WaBot } = require("../models");

const axios = require("axios");

module.exports.Send = (payloadData) => {
  return new Promise((resolve, reject) => {
    const headers = {
      token: token, // global var token
    };
    logger.info({ sending: payloadData, headers });
    axios
      .post(`${config.apiBot}/api/send-chat`, payloadData, { headers })
      .then((res) => {
        if (
          res.data.status !== 200 &&
          res.data.message == "Session tidak ditemukan"
        ) {
          console.log(
            "[!] Error WABOT :",
            res.data.message,
            "- [WABOT RE-SYNC PROCESS]"
          );
          reSend(payloadData);
          resolve(true);
        } else {
          logger.info({ received: res.data.data });
          resolve(res.data.data);
        }
      })
      .catch((err) => {
        logger.info(err);
        reject(err);
      });
  });
};

async function reSend(payloadData) {
  try {
    const wabot = await WaBot.findOne({ attributes: ["id", "key"] });
    token = wabot.key;
    const headers = {
      token: token, // global var token
    };
    logger.info({ resending: payloadData, headers });
    axios
      .post(`${config.apiBot}/api/send-chat`, payloadData, { headers })
      .then((res) => {
        logger.info({ received: res.data.data });
      })
      .catch((err) => {
        logger.info(err);
        reject(err);
      });
  } catch (error) {
    console.log("[!] Error : ", error);
  }
}
