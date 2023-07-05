const router = require("express").Router();
const Agen = require("./agen");
const AgenProduct = require("./agenProduct");
const Commission = require("./commission");
const Member = require("./member");
const Refferal = require("./referral");
const Testimonial = require("./testimonial");
const IsAdmin = require("../../middleware/isAdmin");

router.use("/agen", Agen);
router.use("/agen-product", AgenProduct);
router.use("/commission", Commission);
router.use("/member", IsAdmin, Member);
router.use("/refferal", Refferal);
router.use("/testimoni", Testimonial);

module.exports = router;
