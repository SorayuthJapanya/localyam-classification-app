const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

exports.protectRoute = async (req, res, next) => {
  try {
    // Check token
    const token = req.cookies["jwt-yamleaves"];
    if (!token)
      return res
        .status(401)
        .json({ message: "Unaithorized - No Token Provided " });

    // Decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Provided" });

    // Find User
    const user = await User.findById(decoded.userID).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protextRoute Middleware: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
