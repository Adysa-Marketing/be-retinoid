const router = require("express").Router();
const ChangeStatus = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", Get);
router.post("/list", List);
router.post("/create", IsAdmin, Create);
router.put("/update", IsAdmin, Update);
router.put("/change-status", IsAdmin, ChangeStatus);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
