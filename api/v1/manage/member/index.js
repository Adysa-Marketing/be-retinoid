const router = require("express").Router();
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Get = require("./get");
const List = require("./list");

router.get("/get/:id", Get);
router.get("/list", List);
router.put("/change-pass", ChangePass);
router.put("/change-status", ChangeStat);

module.exports = router;
