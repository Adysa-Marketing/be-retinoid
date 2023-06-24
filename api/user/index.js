const router = require("express").Router();

const Login = require("./login");
const Register = require("./register");
const Testimoni = require("./testimoni");

// API Routing
router.post("/login", Login);
router.post("/register", Register);
router.post("/testimoni", Testimoni);

module.exports = router;
