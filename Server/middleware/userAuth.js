const jwt = require("jsonwebtoken");

const isLogin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); 
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT verification error:", error); 
    return res.status(401).json({ error: "Invalid token." });
  }
};

const isLogout = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      jwt.verify(token, process.env.SECRET_KEY);
      return res.status(403).json({ error: "Already logged in." }); 
    } catch (error) {
      next();
    }
  } else {
    next(); 
  }
};

// Use `module.exports` to export
module.exports = {
  isLogin,
  isLogout,
};
