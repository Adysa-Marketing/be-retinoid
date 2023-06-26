const router = require("express").Router();
const Create = require("./create");
const Delete = require("./delete");
const Dropdown = require("./dropdown");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const IsAdmin = require("../../middleware/isAdmin");

router.get("/get/:id", Get);
router.get("/list", List);
router.get("/dropdown", Dropdown);
router.post("/create", IsAdmin, Create);
router.put("/update", IsAdmin, Update);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
