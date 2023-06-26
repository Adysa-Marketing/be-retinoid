const router = require("express").Router();
const Testimonial = require("./testimonial");
const UserBank = require("./userbank");

router.use("/testimoni", Testimonial);
router.use("/bank", UserBank);

module.exports = router;
