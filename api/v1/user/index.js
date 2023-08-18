const router = require("express").Router();

const Login = require("./login");
const Password = require("./password");
const Register = require("./register");

// API Routing
router.post("/login", Login);
router.post("/register", Register);
router.post("/reset/sendotp", Password.SendOtp);
router.post("/reset/verify", Password.Verify);
router.post("/reset/isvalid", Password.IsValid);
router.put("/reset/change", Password.ResetChange);

module.exports = router;
