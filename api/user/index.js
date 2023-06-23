const router = require("express").router();

const Login = require("./login");
const Register = require("./register");

// API Routing
router.post("/login", Login);
router.post("/register", Register);

module.exports = router;
