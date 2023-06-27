const router = require("express").Router();

const ChangePass = require("./changepassword");
const Login = require("./login");
const Password = require("./password");
const Register = require("./register");
const Testimoni = require("./testimoni");

// API Routing
router.put("/change-pass", ChangePass);
router.post("/login", Login);
router.post("/register", Register);
router.post("/testimoni", Testimoni);
router.post("/reset/sendOtp", Password.SendOtp);
router.post("/reset/isValid", Password.Confirm);
router.put("/reset/change", Password.ResetChange);

module.exports = router;
