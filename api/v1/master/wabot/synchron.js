const wabot = require("../../../../libs/wabot");
const logger = require("../../../../libs/logger");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;
  try {
    const schema = {
      recipient: {
        type: "string",
        pattern: /^(08|628)[0-9]{9,13}$/,
        messages: {
          pattern: "No Telpon Tidak Valid",
        },
        min: 9,
        max: 13,
        empty: false,
      },
      message: "string|empty:false",
      key: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    // global var token wa
    token = source.key;

    wabot.Send({
      to: source.recipient,
      message: source.message,
    });

    logger.info({ source });

    return res.json({
      status: "success",
      message: "Synchronization WA BOT in process...",
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
