const app = require("express").Router();
const Auth = require("./auth");
// const userRouter = require("./userRouter");
// app.use("/api/v1/user", userRouter);

const Master = require("../api/master");
const User = require("../api/user");

// Auth Unless
app.use(
  Auth.unless({
    path: ["/user/login", "/user/register"],
  })
);

// Routing API
app.use("/master", Master);
app.use("/user", User);

module.exports = app;
