const router = require("express").Router();
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", Get);
router.post("/list", List);
router.post("/create", IsAdmin, Create);
router.post("/update", IsAdmin, Update);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
