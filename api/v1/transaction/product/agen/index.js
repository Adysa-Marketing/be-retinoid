const router = require("express").Router();
const Asset = require("./asset");
const ChangeStatus = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../../libs/upload");
const IsAgen = require("../../../../middleware/isAgen");

router.get("/get/:id", IsAgen, Get);
router.post("/list", IsAgen, List);
router.post(
  "/create",
  IsAgen,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.post(
  "/update",
  IsAgen,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Update
);
router.put("/change-status", IsAgen, ChangeStatus);
router.delete("/delete", IsAgen, Delete);

module.exports = router;
