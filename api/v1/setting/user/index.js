const router = require("express").Router();
const Asset = require("./asset");
const ChangePass = require("./changepassword");
const Get = require("./get");
const Update = require("./update");
const Upload = require("../../../../libs/upload");

router.get("/get/:id", Get);
router.put("/change-pass", ChangePass);
router.put(
  "/update",
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Update
);

module.exports = router;
