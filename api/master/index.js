const router = require("express").Router();
const Reward = require("./reward");
const Serial = require("./serial");

router.use("/reward", Reward);
router.use("/serial", Serial);

module.exports = router;
