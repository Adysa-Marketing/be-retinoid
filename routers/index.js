const app = require("express").Router();
const Auth = require("./auth");
// const userRouter = require("./userRouter");
// app.use("/api/v1/user", userRouter);

const Dropdown = require("../api/v1/dropdown");
const Manage = require("../api/v1/manage");
const Master = require("../api/v1/master");
const Network = require("../api/v1/network");
const Setting = require("../api/v1/setting");
const Transaction = require("../api/v1/transaction");
const User = require("../api/v1/user");
const wabot = require("../libs/wabot");

//testing wa bot
// app.post("/send-chat", async (req, res) => {
//   wabot.Send({
//     to: "085325224829",
//     message: `[Transaksi Widhraw] - ADYSA MARKETING\n\nHi *Redha*, permintaan widhraw berhasil dengan detail : \n\n1. Nominal Widhraw : Rp.*Rp.${new Intl.NumberFormat(
//       "id-ID"
//     ).format(50000)}* \n2. Biaya Admin : Rp.*Rp.${new Intl.NumberFormat(
//       "id-ID"
//     ).format(10000)}* \n3. Nominal Approve : Rp.*Rp.${new Intl.NumberFormat(
//       "id-ID"
//     ).format(
//       parseInt(50000) - 10000
//     )}* \n\nData yang anda ajukan akan segera di proses oleh admin, mohon kesediaan-nya untuk menunggu. \n\nTrimakasih`,
//   });
//   return res.send("oke");
// });

// Auth Unless
app.use(
  Auth.unless({
    path: [
      "/api/v1/user/login",
      "/api/v1/user/reset/sendotp",
      "/api/v1/user/reset/verify",
      "/api/v1/user/reset/isvalid",
      "/api/v1/user/reset/change",
      "/api/v1/user/register",
      "/api/v1/master/article/list",
      "/api/v1/master/article/detail/:slug",
      "/api/v1/master/package/get/:id",
      "/api/v1/master/package/list",
      "/api/v1/dropdown/role",
      "/api/v1/dropdown/tr-status",
      "/api/v1/dropdown/payment-type",
      "/api/v1/dropdown/rw-status",
      "/api/v1/dropdown/wd-status",
      "/api/v1/dropdown/commission-level",
      "/api/v1/dropdown/agen-status",
      "/api/v1/dropdown/country",
      "/api/v1/dropdown/province",
      "/api/v1/dropdown/district",
      "/api/v1/dropdown/sub-district",
      "/api/v1/master/article/list",
    ],
  })
);

// Routing API
app.use("/dropdown", Dropdown);
app.use("/manage", Manage);
app.use("/master", Master);
app.use("/network", Network);
app.use("/setting", Setting);
app.use("/trx", Transaction);
app.use("/user", User);

module.exports = app;
