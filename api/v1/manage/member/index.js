const router = require("express").Router();
const ChangeAccountLevel = require("./changeAccountLevel");
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Get = require("./get");
const InjectSaldo = require("./injectSaldo");
const IsAdmin = require("../../../middleware/isAdmin");
const List = require("./list");

router.get("/get/:id", IsAdmin, Get);
router.post("/inject-saldo", IsAdmin, InjectSaldo);
router.post("/list", IsAdmin, List);
router.put("/change-level", IsAdmin, ChangeAccountLevel);
router.put("/change-pass", IsAdmin, ChangePass);
router.put("/change-status", IsAdmin, ChangeStat);

module.exports = router;
