const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Expire after 5 minutes
  },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;  // CommonJS export
