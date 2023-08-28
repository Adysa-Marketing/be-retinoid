const router = require("express").Router();
const Dropdown = require("./dropdown");
const Get = require("./get");
const List = require("./list");

router.get("/get/:productId", Get);
router.get("/dropdown", Dropdown);
router.post("/list", List);

module.exports = router;
