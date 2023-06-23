const router = require("express").Router();
const Asset = require("./asset");
const ChangeStat = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../libs/upload");
const IsRoot = require("../../middleware/isRoot");

router.get("/get/:id", Get);
router.get("/list", List);
router.post(
  "/create",
  IsRoot,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.put(
  "/update",
  Asset.Directory,
  Update.fields([{ name: "image", maxCount: 1 }]),
  Update
);
router.put("/change-status",IsRoot, ChangeStat);
router.delete("/delete",IsRoot, Delete);

module.exports = router;
