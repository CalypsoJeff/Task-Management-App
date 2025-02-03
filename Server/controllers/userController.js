const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { generateToken } = require("../helper/jwtHelper");
const { generateOTP, sendOtp } = require("../utility/nodeMailer");
// Register User and Send OTP
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // Validate input
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    // Check if the email or phone number is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const user = req.session.user_id;
      return res
        .status(400)
        .json({ error: "Email or Mobile Number already registered." });
    } else {
      const UserData = {
        name: name,
        email: email,
        password: password,
        phone: phone,
      };
      // Generate OTP
      const otpSaved = generateOTP();
      console.log("Generated OTP:", otpSaved);
      req.session.otpUser = { ...UserData, otpSaved };
      /***** otp sending ******/
      sendOtp(email, otpSaved, name);
      res.status(200).json({
        message:
          "OTP sent successfully. Please verify to complete registration.",
      });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      error: "An error occurred during registration. Please try again later.",
    });
  }
};

// Verify OTP and Register User
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { otp } = req.body;
    // Validate OTP
    if (!otp) {
      return res.status(400).json({ error: "OTP is required." });
    }
    // Check if OTP exists in session
    const sessionData = req.session.otpUser;
    if (!sessionData) {
      return res
        .status(400)
        .json({ error: "OTP expired. Please register again." });
    }
    const { name, email, phone, password, otpSaved } = sessionData;
    if (otpSaved != otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();
    const { token, refreshToken } = generateToken(name, email, "user");
    req.session.otpUser = null;
    res.status(201).json({
      message: "Registration successful! Redirecting to home page.",
      token,
      refreshToken,
      user: newUser,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      error:
        "Internal server error. Failed to verify OTP. Please try again later.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and Password are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    if (user && user.is_blocked) {
      return res
        .status(400)
        .json({ error: "User is blocked. Please contact support." });
    }
    const role = "user";
    const { token, refreshToken } = generateToken(user.name, user.email, role);
    const { password: _, ...userWithoutPassword } = user._doc;
    res
      .status(200)
      .json({
        status: "success",
        message: "Login successful!",
        userWithoutPassword,
        token,
        refreshToken,
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      error: "An error occurred during login. Please try again later.",
    });
  }
};

module.exports = {
  registerUser,
  verifyOtpAndRegister,
  login,
};
