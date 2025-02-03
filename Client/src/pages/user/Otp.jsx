import { useState, useRef } from "react";
import { otpVerification } from "../../api/endpoints/auth/user-auth";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import {useDispatch} from 'react-redux'
import { login } from "../../features/auth/authSlice";


const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const dispatch = useDispatch();
  const location = useLocation();

  // Extract data from the location state
  const { email, phone, name, password } = location.state || {};

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    const otpData = { otp: otpValue, email, phone, name, password };

    try {
      const response = await otpVerification(otpData);
      console.log("Verifying OTP:", response.data);
      dispatch(
        login({
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        })
      );

      // Show success notification
      toast.success("OTP verified successfully. Redirecting...");
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error verifying OTP:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.error || "Failed to verify OTP. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBECD9]">
      <div className="bg-[#FDFDFD] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#070407] mb-2">
            Verify Your Email
          </h2>
          <p className="text-[#585858]">We&apos;ve sent a code to your email</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-[#85ACD0] focus:outline-none bg-[#F1FFC7] text-[#2C3A28]"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-[#A1CE01] hover:bg-[#D5FFA0] text-[#161913] font-bold py-3 rounded-lg mb-4 transition duration-300"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default Otp;
