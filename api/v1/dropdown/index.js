const router = require("express").Router();
const Dropdown = require("./dropdown");

router.get("/role", Dropdown.Role);
router.get("/tr-status", Dropdown.TrStatus);
router.get("/payment-type", Dropdown.PaymentType);
router.get("/rw-status", Dropdown.RwStatus);
router.get("/wd-status", Dropdown.WdStatus);
router.get("/commission-level", Dropdown.CommissionLevel);
router.get("/agen-status", Dropdown.AgenStatus);
router.get("/country", Dropdown.Country);
router.get("/province", Dropdown.Province);
router.get("/district", Dropdown.District);
router.get("/sub-district", Dropdown.SubDistrict);

module.exports = router;
