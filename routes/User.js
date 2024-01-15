const express = require('express');
const router = express.Router();

//Import required controllers and middleware functions
const {login, signUp, sendOTP, changePassword} = require('../controllers/Auth');

const {resetPassword, resetPasswordToken} = require('../controllers/ResetPassword');

const {auth} = require('../middlewares/auth');

router.post("/login",login);
router.post("/signup",signUp);
router.post("/send-otp",sendOTP);
router.post("/changePassword",changePassword);

router.post("/reset-password",resetPassword);
router.post("/reset-password-token",resetPasswordToken);

module.exports = router;