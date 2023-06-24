const app = require("express").Router();
const Auth = require("./auth");
// const userRouter = require("./userRouter");
// app.use("/api/v1/user", userRouter);

const Master = require("../api/v1/master");
const User = require("../api/v1/user");

// Auth Unless
// app.use(
//   Auth.unless({
//     path: ["/user/login", "/user/register", '/user/testiomoni'],
//   })
// );

// Routing API
app.use("/master", Master);
app.use("/user", User);

module.exports = app;
