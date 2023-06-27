const router = require("express").Router();
const Testimonial = require("./testimonial");
const User = require("./user");
const UserBank = require("./userbank");

router.use("/testimoni", Testimonial);
router.use("/user", User);
router.use("/bank", UserBank);

module.exports = router;
