const router = require("express").Router();
const Get = require("./get");
const List = require("./list");

router.get("/get/:id", Get);
router.post("/list", List);

module.exports = router;
