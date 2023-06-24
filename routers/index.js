const app = require("express").Router();
const Auth = require("./auth");
// const userRouter = require("./userRouter");
// app.use("/api/v1/user", userRouter);

const Master = require("../api/v1/master");
const User = require("../api/v1/user");

// Auth Unless
app.use(
  Auth.unless({
    path: ["/api/v1/user/login", "/user/register", "/api/v1/user/testimoni"],
  })
);

// Routing API
app.use("/master", Master);
app.use("/user", User);

module.exports = app;
