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

// Auth Unless
app.use(
  Auth.unless({
    path: [
      "/api/v1/user/login",
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
