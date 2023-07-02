const router = require("express").Router();
const Asset = require("./asset");
const ChangePass = require("./changepassword");
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../libs/upload");
const IsRoot = require("../../../middleware/isRoot");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", IsAdmin, Get);
router.post("/list", IsAdmin, List);
router.post(
  "/create",
  IsRoot,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.put(
  "/update",
  IsRoot,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Update
);
router.put("/change-pass", IsRoot, ChangePass);
router.put("/change-status", IsRoot, ChangeStat);
router.delete("/delete", IsRoot, Delete);

module.exports = router;
