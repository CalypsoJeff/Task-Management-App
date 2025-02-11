import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY 
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
/**
 * Generates an access token and a refresh token.
 * @param {string} user - The username or user ID.
 * @param {string} email - The user's email.
 * @param {string} role - The user's role.
 * @returns {Object} An object containing the access token and refresh token.
 */
export const generateToken = (user,userId ,email, role) => {
  try {
    const token = jwt.sign({ user,userId ,email, role }, SECRET_KEY, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign({ user,userId, email, role }, REFRESH_SECRET_KEY, {
      expiresIn: "5d",
    });

    return { token, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new Error("Token generation failed");
  }
};

/**
 * Generates a password reset token.
 * @param {string} email - The user's email.
 * @returns {string} A reset token valid for 15 minutes.
 */
export const generateResetToken = (email) => {
  try {
    const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });
    return resetToken;
  } catch (error) {
    console.error("Error generating reset token:", error);
    throw new Error("Reset token generation failed");
  }
};

/**
 * Validates a password reset token.
 * @param {string} token - The token to validate.
 * @param {string} email - The user's email.
 * @returns {boolean} True if the token is valid and matches the email, false otherwise.
 */
export const validateResetToken = (token, email) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Ensure the email in the token matches the provided email
    if (decoded.email !== email) {
      console.error("Token validation failed: Email mismatch");
      return false;
    }

    return true; // Token is valid
  } catch (error) {
    console.error("Token validation error:", error);
    return false; // Token is invalid
  }
};
