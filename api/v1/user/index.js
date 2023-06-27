const router = require("express").Router();

const Login = require("./login");
const Password = require("./password");
const Register = require("./register");
const Testimoni = require("./testimoni");

// API Routing
router.post("/login", Login);
router.post("/register", Register);
router.post("/testimoni", Testimoni);
router.post("/reset/sendOtp", Password.SendOtp);
router.post("/reset/isValid", Password.Confirm);
router.put("/reset/change", Password.ResetChange);

module.exports = router;
