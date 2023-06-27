const app = require("express").Router();
const Auth = require("./auth");
// const userRouter = require("./userRouter");
// app.use("/api/v1/user", userRouter);

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
      "/api/v1/user/testimoni",
      "/api/v1/master/package/get/:id",
      "/api/v1/master/package/list",
    ],
  })
);

// Routing API
app.use("/manage", Manage);
app.use("/master", Master);
app.use("/network", Network);
app.use("/setting", Setting);
app.use("/trx", Transaction);
app.use("/user", User);

module.exports = app;
