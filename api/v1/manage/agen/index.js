const router = require("express").Router();
const ChangeAccountLevel = require("./changeAccountLevel");
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const InjectSaldo = require("./injectSaldo");
const IsAdmin = require("../../../middleware/isAdmin");
const List = require("./list");

router.use("/", IsAdmin);
router.get("/get/:id", Get);
router.post("/inject-saldo", IsAdmin, InjectSaldo);
router.post("/list", List);
router.post("/create", Create);
router.put("/change-level", IsAdmin, ChangeAccountLevel);
router.put("/change-pass", ChangePass);
router.put("/change-status", ChangeStat);
router.delete("/delete", Delete);

module.exports = router;
