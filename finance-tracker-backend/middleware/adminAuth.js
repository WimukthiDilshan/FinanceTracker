const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded); // The decoded token now includes isAdmin

    if (!decoded.isAdmin) {  // Check isAdmin from the token
      console.log("⛔ Access Denied: User is not an admin");
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = await User.findById(decoded.id); // Fetch full user data
    console.log("✅ Admin access granted");
    next();
  } catch (error) {
    console.error("🔥 Error in Admin Auth Middleware:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminAuth;
