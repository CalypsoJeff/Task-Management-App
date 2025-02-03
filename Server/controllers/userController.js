const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const otp = require("../models/otpModel");
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
      // req.session.otpUser = { ...UserData, otpSaved };
      const savedOtp = await new otp({ otpSaved, email }).save();
      console.log("Saved OTP:", savedOtp);

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
    const { otp, email } = req.body;
    console.log(req.body,"req.body");
    

    // Validate input
    if (!otp || !email) {
      return res.status(400).json({ error: "OTP and email are required." });
    }

    // Check if OTP exists in the database for the given email
    const otpRecord = await otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not found." });
    }

    // Compare the provided OTP with the stored OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // OTP is valid, proceed with registration
    const { name, phone, password } = req.body; // Ensure these are sent in the request body

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate tokens
    const { token, refreshToken } = generateToken(name, email, "user");

    // Delete OTP record after successful verification
    await otp.deleteOne({ email });

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
    res.status(200).json({
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
