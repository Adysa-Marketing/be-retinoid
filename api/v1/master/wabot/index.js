const router = require("express").Router();
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Synchron = require("./synchron");
const Update = require("./update");
const IsAdmin = require("../../../middleware/isAdmin");

router.use("/", IsAdmin);
router.get("/get/:id", Get);
router.post("/list", List);
router.post("/create", Create);
router.post("/update", Update);
router.post("/synchron", Synchron);
router.delete("/delete", Delete);

module.exports = router;
