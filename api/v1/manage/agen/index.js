const router = require("express").Router();
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", IsAdmin, Get);
router.post("/list", IsAdmin, List);
router.post("/create", IsAdmin, Create);
router.put("/change-pass", IsAdmin, ChangePass);
router.put("/change-status", IsAdmin, ChangeStat);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
