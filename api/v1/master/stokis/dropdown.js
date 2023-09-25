const { Stokis, TrStokis } = require("../../../../models");
const { Op } = require("sequelize");
const sanitizeHtml = require("sanitize-html");

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const checkTrx = await TrStokis.findOne({
      where: {
        userId: user.id,
        statusId: {
          [Op.in]: [1, 4, 5],
        },
      },
    });

    let available = true;
    if (checkTrx) {
      available = false;
    }

    await Stokis.findAll({
      attributes: [
        "id",
        "name",
        "price",
        "discount",
        "agenDiscount",
        "description",
      ],
    })
      .then((response) => {
        response = JSON.parse(JSON.stringify(response));
        const data = response.map((item) => {
          item.description = sanitizeHtml(item.description, {
            allowedTags: [],
            allowedAttributes: {},
          });

          return item;
        });
        return res.json({
          status: "success",
          available,
          data,
        });
      })
      .catch((error) => {
        console.log("[!] Error : ", error);
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      });
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
