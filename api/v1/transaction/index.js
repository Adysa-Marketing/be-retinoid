const router = require("express").Router();
const Mutation = require("./mutation");
const Product = require("./product");
const Reward = require("./reward");
const Statistic = require("./statistic");
const Stokis = require("./stokis");
const Widhraw = require("./widhraw");

router.use("/mutation", Mutation);
router.use("/product", Product);
router.use("/reward", Reward);
router.use("/stat", Statistic);
router.use("/stokis", Stokis);
router.use("/widhraw", Widhraw);

module.exports = router;
