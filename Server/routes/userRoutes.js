const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Registering User and Sending OTP
router.post("/register", userController.registerUser);
//  Verify OTP and Complete Registration
router.post("/verify-otp", userController.verifyOtpAndRegister);
router.post("/login", userController.login);

// Export the router
module.exports = router;