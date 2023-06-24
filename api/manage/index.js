const router = require("express").Router();
const Stokis = require("./stokis");

router.use("/stokis", Stokis);

module.exports = router;
