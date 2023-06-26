const router = require("express").Router();
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get", Get);
router.get("/list", IsAdmin, List);
router.post("/create", Create);
router.put("/update", Update);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
