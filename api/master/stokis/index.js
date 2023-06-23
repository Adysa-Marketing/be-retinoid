const router = require("express").Router();
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");

router.get("/get/:id", Get);
router.get("/list", List);
router.post("/create", Create);
router.put("/update", Update);
router.delete("/delete", Delete);

module.exports = router;
