import mongoose, { Document, Schema } from "mongoose";

const otpSchema = new mongoose.Schema(
  {
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
      expires: 300,
    },
  },
  { timestamps: true }
);

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;
