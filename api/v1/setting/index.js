const router = require("express").Router();
const Testimonial = require("./testimonial");

router.use("/testimoni", Testimonial);

module.exports = router;
