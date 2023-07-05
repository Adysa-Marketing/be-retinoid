const router = require("express").Router();
const Asset = require("./asset");
const Create = require("./create");
const Delete = require("./delete");
const Dropdown = require("./dropdown");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../libs/upload");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", Get);
router.get("/dropdown", Dropdown);
router.post("/list", List);
router.post(
  "/create",
  IsAdmin,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.post(
  "/update",
  IsAdmin,
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Update
);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
