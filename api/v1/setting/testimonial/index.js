const router = require("express").Router();
const Create = require("./create");
const Get = require("./get");
const Update = require("./update");

router.get("/get", Get);
router.post("/create", Create);
router.post("/update", Update);

module.exports = router;
