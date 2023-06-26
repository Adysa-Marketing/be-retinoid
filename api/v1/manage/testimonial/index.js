const router = require("express").Router();
const Delete = require("./delete");
const List = require("./list");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/list", IsAdmin, List);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
