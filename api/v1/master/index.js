const router = require("express").Router();
const AccountLevel = require("./accountLevel");
const Admin = require("./admin");
const Article = require("./article");
const Bank = require("./bank");
const CommissionLevel = require("./commissionLevel");
const Package = require("./package");
const Product = require("./product");
const ProductCategory = require("./productcategory");
const Reward = require("./reward");
const Serial = require("./serial");
const Stokis = require("./stokis");
const WaBot = require("./wabot");

router.use("/account-level", AccountLevel);
router.use("/admin", Admin);
router.use("/article", Article);
router.use("/bank", Bank);
router.use("/commission-level", CommissionLevel);
router.use("/package", Package);
router.use("/product", Product);
router.use("/product-category", ProductCategory);
router.use("/reward", Reward);
router.use("/serial", Serial);
router.use("/stokis", Stokis);
router.use("/wa-bot", WaBot);

module.exports = router;
