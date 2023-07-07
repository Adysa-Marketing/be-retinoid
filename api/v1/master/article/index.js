const router = require("express").Router();
const Asset = require("./asset");
const Create = require("./create");
const ChangeStatus = require("./changeStatus");
const Delete = require("./delete");
const Detail = require("./detail");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../libs/upload");
const IsAdmin = require("../../../middleware/isAdmin");

router.get("/get/:id", IsAdmin, Get);
router.get("/detail/:slug", Detail);
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
router.put("/change-status", IsAdmin, ChangeStatus);
router.delete("/delete", IsAdmin, Delete);

module.exports = router;
