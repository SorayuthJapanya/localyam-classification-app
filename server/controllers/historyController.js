const Classification = require("../models/classificationModel");
const HistoryClassificationStat = require("../models/historyClassificationModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.getAllHistory = async (req, res) => {
  try {
    const { name = "" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const speciesQuery = req.query.species || "All";

    const speciesOption = await Classification.distinct("bestpredicted");

    const selectedSpecies =
      speciesQuery === "All" ? speciesOption : speciesQuery.split(",");

    let query = {};
    if (name) {
      query.userName = { $regex: name, $options: "i" };
    }
    if (selectedSpecies.length > 0) {
      query.bestpredicted = { $in: selectedSpecies };
    }

    const histories = await Classification.find(query)
      .sort({ datetime_taken: -1 })
      .skip(skip)
      .limit(limit);

    if (histories.length === 0) {
      return res.status(200).json({
        totalHistories: 0,
        totalPages: 1,
        page: page,
        limit,
        histories: [],
        message: "No history found",
      });
    }

    const totalHistories = await Classification.countDocuments(query);

    const response = {
      totalHistories,
      totalPages: Math.ceil(totalHistories / limit),
      page: page,
      limit,
      histories,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error in getAllClassification controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getDataHistory = async (req, res) => {
  try {
    const data = await Classification.find();

    res.status(200).json(data);
  } catch (error) {
    console.log("Error in getDataHistory controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getHistoryDataSelected = async (req, res) => {
  try {
    const { dataId } = req.query;

    if (!dataId || dataId.length === 0) {
      return res.status(400).json({ message: "Data is required" });
    }

    // รองรับกรณี dataId เป็น string เดียว (ไม่ใช่ array)
    const dataIds = Array.isArray(dataId) ? dataId : [dataId];

    const data = await Classification.find({
      _id: { $in: dataIds },
    }).sort({ datetime_taken: -1 });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No history found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getHistoryDataSelected controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getHistortById = async (req, res) => {
  try {
    const { _id } = req.params;

    const classificationHistory = await Classification.find({ userId: _id });
    if (!classificationHistory || classificationHistory.length === 0) {
      return res.status(404).json({ message: "Your history not found" });
    }

    res.status(200).json(classificationHistory);
  } catch (error) {
    console.error("Error in getHistortById controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateHistoryById = async (req, res) => {
  try {
    const { _id } = req.params;
    const { latitude, longitude } = req.body;

    // Find the history record
    const history = await Classification.findById(_id);
    if (!history) {
      return res.status(404).json({ message: "Your history not found" });
    }

    // Update fields if provided
    if (latitude) history.latitude = latitude;
    if (longitude) history.longitude = longitude;

    const totalHistories = await Classification.countDocuments();

    const newHistoryStat = new HistoryClassificationStat({
      totalHistories: totalHistories,
      updatedAt: new Date(),
    });

    await newHistoryStat.save();

    // Save the updated record
    await history.save();

    res.status(200).json({ message: "Updated GPS successfully" });
  } catch (error) {
    console.error("Error in updateHistoryById controller:", error); // Improved error log
    res
      .status(500)
      .json({ message: "Update GPS failed", error: error.message });
  }
};

exports.deleteHistortById = async (req, res) => {
  try {
    const { _id } = req.params;

    const history = await Classification.findByIdAndDelete(_id);
    if (!history)
      return res.status(404).json({ message: "Your history not found" });

    if (history.imageUrl) {
      const imagePath = path.join(__dirname, "../uploads", history.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) return console.log("Error Delete image file");
      });
    }

    const totalHistories = await Classification.countDocuments();

    const newHistoryStat = new HistoryClassificationStat({
      totalHistories: totalHistories,
      updatedAt: new Date(),
    });

    await newHistoryStat.save();

    res.status(200).json({
      message: "History deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteHistortById controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteAllHistory = async (req, res) => {
  try {
    const { _id } = req.params;

    // ดึงรายการทั้งหมดของ userId นั้น
    const histories = await Classification.find({ userId: _id });

    if (!histories || histories.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this user" });
    }

    // ลบไฟล์รูปที่เกี่ยวข้อง
    histories.forEach((history) => {
      if (history.imageUrl) {
        const imagePath = path.join(
          __dirname,
          "../uploads",
          path.basename(history.imageUrl)
        );
        fs.unlink(imagePath, (err) => {
          if (err) console.log("Error deleting image file:", err);
        });
      }
    });

    // ลบจาก DB
    const deleteResult = await Classification.deleteMany({ userId: _id });

    const totalHistories = await Classification.countDocuments(query);

    const newHistoryStat = new HistoryClassificationStat({
      totalHistories: totalHistories,
      updatedAt: new Date(),
    });

    await newHistoryStat.save();

    res.status(200).json({
      message: "All history records deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteAllHistory controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.searchHistories = async (req, res) => {
  try {
    const { name = "", species = "" } = req.query;
    let query = {};

    if (!name && !species) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (name && species) {
      query = {
        userName: { $regex: name, $options: "i" },
        bestpredicted: { $regex: species, $options: "i" },
      };
    } else if (name) {
      query = { userName: { $regex: name, $options: "i" } };
    } else if (species) {
      query = { bestpredicted: { $regex: species, $options: "i" } };
    }

    const result = await Classification.find(query);

    if (result.length === 0) {
      return res.status(404).json({ message: "Histories not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in searchHistories controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getHistoryStat = async (req, res) => {
  try {
    const range = req.query.range || "day";

    const latestRecord = await HistoryClassificationStat.findOne().sort({
      createdAt: -1,
    });
    if (!latestRecord) {
      return res.status(200).json({ totalHistories: 0, data: [] });
    }

    const endDate = new Date(latestRecord.createdAt);
    let startDate = new Date(endDate);

    switch (range) {
      case "day":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "year":
        startDate.setDate(endDate.getDate() - 365);
        break;
      default:
        startDate.setDate(endDate.getDate() - 1);
    }

    const result = await HistoryClassificationStat.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
      range,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching history stat", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
