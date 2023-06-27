const router = require("express").Router();
const Generation = require("./generation");

router.get("/generation", Generation);

module.exports = router;
