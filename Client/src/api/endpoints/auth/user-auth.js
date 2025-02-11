import END_POINTS from "../../../constants/endpoints";
import {
  register,
  userLogin,
  verifyOTP,
} from "../../services/auth/user-auth-service";

export const registerUser = (userData) => {
  return register(END_POINTS.REGISTER, userData);
};

export const otpVerification = (otpData) => {
  return verifyOTP(END_POINTS.VERIFY_OTP, otpData);
};

export const loginUser = (userData) => {
  return userLogin(END_POINTS.LOGIN, userData);
};


