const router = require("express").Router();
const Stokis = require("./stokis");
const Widhraw = require("./widhraw");

router.use("/stokis", Stokis);
router.use("/widhraw", Widhraw);

module.exports = router;
