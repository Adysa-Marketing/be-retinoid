const router = require("express").Router();
const List = require("./list");

router.get("/list", List);

module.exports = router;
