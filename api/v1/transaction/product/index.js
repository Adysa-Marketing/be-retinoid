const router = require("express").Router();
const Agen = require("./agen");
const Asset = require("./asset");
const ChangeStatus = require("./changestatus");
const Create = require("./create");
const Delete = require("./delete");
const Get = require("./get");
const List = require("./list");
const Update = require("./update");
const Upload = require("../../../../libs/upload");

router.get("/get/:id", Get);
router.post("/list", List);
router.post(
  "/create",
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Create
);
router.put(
  "/update",
  Asset.Directory,
  Upload.fields([{ name: "image", maxCount: 1 }]),
  Update
);
router.put("/change-status", ChangeStatus);
router.delete("/delete", Delete);

// transaksi product milik agen/stokis
router.use("/agen", Agen);

module.exports = router;
