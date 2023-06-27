const router = require("express").Router();
const ChangePass = require("./changepassword");
const Get = require("./get");
const Update = require("./update");

router.get("/get/:id", Get);
router.put("/change-pass", ChangePass);
router.put("/update", Update);

module.exports = router;
