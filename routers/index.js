const app = require("express").Router();
const userRouter = require("./userRouter");

app.use("/api/v1/user", userRouter);

module.exports = app;
