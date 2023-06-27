const router = require("express").Router();
const Commission = require("./commission");
const Member = require("./member");
const Mutation = require("./mutation");
const Refferal = require("./referral");
const Stokis = require("./stokis");
const Testimonial = require("./testimonial");
const IsAdmin = require("../../middleware/isAdmin");

router.use("/commission", Commission);
router.use("/member", IsAdmin, Member);
router.use("/mutation", IsAdmin, Mutation);
router.use("/refferal", Refferal);
router.use("/stokis", Stokis);
router.use("/testimoni", Testimonial);

module.exports = router;
