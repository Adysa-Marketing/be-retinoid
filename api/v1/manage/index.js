const router = require("express").Router();
const Stokis = require("./stokis");
const Member = require("./member");
const IsAdmin = require("../../middleware/isAdmin");

router.use("/member", IsAdmin, Member);
router.use("/stokis", Stokis);

module.exports = router;
