const router = require('express').Router()
const { loginHandler, registerHandler, userInfoHandler } = require('../../controller/v1/user');
const userVerification = require('../../middleware/auth');

// [POST] Login User
router.post("/login", loginHandler);

// [POST] Register a new user
router.post("/register", registerHandler);

// [GET] Get user data from token
router.get("/", userVerification, userInfoHandler);

module.exports = router