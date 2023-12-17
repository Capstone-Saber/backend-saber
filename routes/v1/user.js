const router = require('express').Router()
const { loginHandler, registerHandler } = require('../../controller/v1/user');

// [POST] Login User
router.post("/login", loginHandler);
// [POST] Register a new user
router.post("/register", registerHandler);

module.exports = router