const { Mutation, Widhraw, TrSale } = require("../../../../models");
const moment = require("moment");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      id: "string|empty:false",
    };

    const validate = v.compile(schema)(req.params);
    if (validate.length)
      return res.status(400).json({
        status: "error",
        message: validate,
      });

    const id = req.params.id;

    let mutation = await Mutation.findOne({
      attributes: [
        "id",
        "amount",
        "type",
        "category",
        "description",
        "remark",
        "createdAt",
      ],
      where: { id },
      include: [
        {
          attributes: [
            "id",
            "amount",
            "noRekening",
            "bankName",
            "accountName",
            "image",
          ],
          model: Widhraw,
        },
        {
          attributes: ["id", "qty", "amount", "paidAmount", "discount"],
          model: TrSale,
        },
      ],
    });

    if (!mutation)
      return res.status(404).json({
        status: "error",
        message: "Data Mutasi tidak ditemukan",
      });

    mutation = JSON.parse(JSON.stringify(mutation));
    mutation.date = moment(mutation.createdAt)
      .utc()
      .add(7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    return res.json({
      status: "success",
      data: mutation,
    });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
