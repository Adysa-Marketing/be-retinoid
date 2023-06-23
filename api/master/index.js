const router = require("express").Router();
const Bank = require("./bank");
const Reward = require("./reward");
const Serial = require("./serial");

router.use("/bank", Bank);
router.use("/reward", Reward);
router.use("/serial", Serial);

module.exports = router;
