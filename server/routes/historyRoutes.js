const express = require("express");
const router = express.Router();

// import controller
const {
  getAllHistory,
  getDataHistory,
  getHistortById,
  getHistoryDataSelected,
  updateHistoryById,
  deleteHistortById,
  deleteAllHistory,
  getHistoryStat,
} = require("../controllers/historyController");

// import middleware
const { protectRoute } = require("../middleware/authMiddleware");

router.get("/get-history", protectRoute, getAllHistory);
router.get("/data-history", protectRoute, getDataHistory);
router.get("/get-history/:_id", protectRoute, getHistortById);
router.get("/history-selected", protectRoute, getHistoryDataSelected);
router.put("/update-history/:_id", protectRoute, updateHistoryById);
router.delete("/delete-history/:_id", protectRoute, deleteHistortById);
router.delete("/delete-all-history/:_id", protectRoute, deleteAllHistory);

// StatRoute
router.get("/stat", protectRoute, getHistoryStat);

module.exports = router;
