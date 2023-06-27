const router = require("express").Router();
const Product = require("./product");
const Reward = require("./reward");
const Stokis = require("./stokis");
const Widhraw = require("./widhraw");

router.use("/product", Product);
router.use("/reward", Reward);
router.use("/stokis", Stokis);
router.use("/widhraw", Widhraw);

module.exports = router;
