const router = require("express").Router();
const Delete = require("./delete");
const List = require("./list");
const IsAdmin = require("../../../middleware/isAdmin");

router.post("/list", IsAdmin, List);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
