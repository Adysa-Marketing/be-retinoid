const router = require("express").Router();
const Widhraw = require("./widhraw");

router.use("/widhraw", Widhraw);

module.exports = router;
