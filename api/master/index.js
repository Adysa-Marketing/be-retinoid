const router = require("express").Router();
const Serial = require("./serial");

router.use("/serial", Serial);

module.exports = router;
