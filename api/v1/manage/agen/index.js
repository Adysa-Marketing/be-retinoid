const router = require("express").Router();
const Asset = require("./asset");
const ChangePass = require('./changepassword')
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Get = require("./get");
const List = require("./list");
const Upload = require("../../../../libs/upload");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", IsAdmin, Get);
router.get("/list", IsAdmin, List);
router.post(
  "/create",
  IsAdmin,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.put("/change-pass", IsAdmin, ChangePass);
router.put("/change-status", IsAdmin, ChangeStat);

module.exports = router;
