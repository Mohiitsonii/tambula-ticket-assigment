const express = require('express');
const { registerUser, loginUser, sendUserPasswordResetEmail, VerifyOtp, resetPassword, getUser } = require('../Controller/userController');

const router = express.Router();

router.route("/user/registeruser").post(registerUser);
router.route("/user/loginuser").post(loginUser);
router.route("/user/:id").get(getUser);
module.exports = router