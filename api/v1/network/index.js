const router = require("express").Router();
const Generation = require("./generation");

router.use("/generation", Generation);

module.exports = router;
