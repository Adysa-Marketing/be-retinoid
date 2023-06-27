const router = require("express").Router();
const Asset = require("./asset");
const ChangeStatus = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../libs/upload");

router.get("/get/:id", Get);
router.get("/list", List);
router.post(
  "/create",
  Asset.Directory,
  Upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imageKtp", maxCount: 1 },
  ]),
  Create
);
router.put(
  "/update",
  Asset.Directory,
  Upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imageKtp", maxCount: 1 },
  ]),
  Update
);
router.put(
  "/change-status",
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  ChangeStatus
);
router.delete("/delete", Delete);

module.exports = router;
