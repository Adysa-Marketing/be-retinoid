const router = require("express").Router();
const Bank = require("./bank");
const Package = require("./package");
const Product = require("./product");
const ProductCategory = require("./productcategory");
const Reward = require("./reward");
const Serial = require("./serial");

router.use("/bank", Bank);
router.use("/package", Package);
router.use("/product", Product);
router.use("/product-category", ProductCategory);
router.use("/reward", Reward);
router.use("/serial", Serial);

module.exports = router;
