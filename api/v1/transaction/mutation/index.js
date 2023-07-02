const router = require("express").Router();
const List = require("./list");

router.post("/list", List);

module.exports = router;
