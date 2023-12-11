const router = require('express').Router()
const { loginHandler, registerHandler } = require('../controller/user');

router.post("/login", loginHandler); // [POST] Login User
router.post("/register", registerHandler); // [POST] Register a new user

module.exports = router