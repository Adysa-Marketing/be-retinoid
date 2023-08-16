const router = require("express").Router();
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const IsAdmin = require("../../../middleware/isAdmin");

router.use("/", IsAdmin);
router.get("/get/:id", Get);
router.post("/list", List);
router.post("/create", Create);
router.put("/change-pass", ChangePass);
router.put("/change-status", ChangeStat);
router.delete("/delete", Delete);

module.exports = router;
