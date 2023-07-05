const router = require("express").Router();
const List = require("./list");
const Get = require("./get");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", IsAdmin, Get);
router.post("/list", IsAdmin, List);

module.exports = router;
