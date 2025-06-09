const express = require("express");
const router = express.Router();

// import
const {
  uploadImages,
  uploadMultipleImages,
} = require("../controllers/uploadController");

// Middleware
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", upload.single("image"), uploadImages); // ENDPOINT:  http://localhost:5001/api/v1/upload
router.post("/upload-all", upload.array("image"), uploadMultipleImages); // ENDPOINT:  http://localhost:5001/api/v1/upload-all

module.exports = router;
