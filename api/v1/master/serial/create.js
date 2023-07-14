const { Serial } = require("../../../../models");
const logger = require("../../../../libs/logger");
const cryptoString = require("crypto-random-string");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  const source = req.body;

  try {
    const schema = {
      amount: "number|empty:false|min:1|max:100",
      remark: "string|empty:false",
    };

    const validate = v.compile(schema)(source);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    let payloadData = [];

    for (let i = 1; i <= source.amount; i++) {
      const payload = {
        serialNumber: cryptoString({ length: 10, type: "numeric" }),
        status: 1,
        remark: source.remark,
      };
      payloadData = [...payloadData, payload];
    }

    logger.info({ source, payloadData });

    await Serial.bulkCreate(payloadData);
    return res.status(201).json({
      status: "success",
      message: `${source.amount} Data Serial berhasil dibuat`,
    });
  } catch (error) {
    console.log("[!]Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
