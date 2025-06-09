const express = require("express");

// import
const {
  signup,
  bulkSignup,
  login,
  logout,
  getCurrentUser,
  getAllClient,
  getUser,
  updateUser,
  updateProfile,
  deleteUser,
  searchUser,
} = require("../controllers/authController");

// middleware
const { protectRoute } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Middleware for Admin Only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const router = express.Router();

router.post("/signup", signup); // ENDPOINT: http://localhost:5001/api/v1/auth/signup
router.post("/bulk-signup", bulkSignup);
router.post("/login", login); // ENDPOINT: http://localhost:5001/api/v1/auth/login
router.post("/logout", logout); // ENDPOINT: http://localhost:5001/api/v1/auth/logout

// Search User
router.get("/search", protectRoute, adminOnly, searchUser); // ENDPOINT: http://localhost:5001/api/v1/auth/search?name=euro

// CRUD API
router.get("/allclient", protectRoute, adminOnly, getAllClient); // ENDPOINT: http://localhost:5001/api/v1/auth/allclient
router.get("/get-user/:_id", protectRoute, getUser); // ENDPOINT: http://localhost:5001/api/v1/auth/get-user/:_id
router.put(
  "/update-user/:_id",
  protectRoute,
  upload.single("image"),
  updateUser
); // ENDPOINT: http://localhost:5001/api/v1/auth/update-user/:_id
router.put(
  "/update-profile/:_id",
  protectRoute,
  upload.single("image"),
  updateProfile
);
router.delete("/delete-user/:_id", protectRoute, adminOnly, deleteUser); // ENDPOINT: http://localhost:5001/api/v1/auth/delete-user/:_id

// middleware check
router.get("/me", protectRoute, getCurrentUser); //ENDPOINT:  http://localhost:5001/api/v1/auth/me

module.exports = router;
