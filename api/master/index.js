const router = require("express").Router();
const Bank = require("./bank");
const Product = require("./product");
const Reward = require("./reward");
const Serial = require("./serial");
const IsAdmin = require("../middleware/isAdmin");

router.use("/bank", IsAdmin, Bank);
router.use("/product", IsAdmin, Product);
router.use("/reward", IsAdmin, Reward);
router.use("/serial", IsAdmin, Serial);

module.exports = router;
