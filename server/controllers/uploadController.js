const axios = require("axios");
const Classification = require("../models/classificationModel");
const HistoryClassificationStat = require("../models/historyClassificationModel");
const fs = require("fs");
const path = require("path");

// Single file upload handler
exports.uploadImages = async (req, res) => {
  try {
    const Currentimage = req.file;
    const {
      userId,
      userName,
      Petiole_color,
      Aerial_Tuber,
      Petiolar_base_color,
      Stem_Type,
      Thorns,
      Stem_Color,
      Phyllotaxy,
      Color_leaf_base,
      Petiole_apex_color,
    } = req.body;

    if (!Currentimage)
      return res.status(400).json({ message: "No file uploaded" });

    const base64Image = fs.readFileSync(Currentimage.path, {
      encoding: "base64",
    });

    const payload = {
      image: base64Image,
      Petiole_color: Petiole_color,
      Aerial_Tuber: Aerial_Tuber,
      Petiolar_base_color: Petiolar_base_color,
      Stem_Type: Stem_Type,
      Thorns: Thorns,
      Stem_Color: Stem_Color,
      Phyllotaxy: Phyllotaxy,
      Color_leaf_base: Color_leaf_base,
      Petiole_apex_color: Petiole_apex_color,
    };

    const response = await axios.post(`${process.env.ML_URL}/predict`, payload);
    const data = response.data;

    // // Handle GPS data
    const latitude = !data.gps?.latitude ? "18.796143" : data.gps.latitude;
    const longitude = !data.gps?.longitude ? "98.979263" : data.gps.longitude;

    // Map probabilities to allpredicted
    const allpredicted = Object.entries(data.all_class_probabilities).map(
      ([className, prob]) => ({
        class: className,
        probability: parseFloat(prob.toFixed(2)), // ปัดเศษให้สวยงาม
      })
    );

    const allfilterpredicted = data.filtered_species_list.map((className) => ({
      class: className,
    }));

    const top5 = data.top5_predictions.map(([className, prob]) => ({
      class: className,
      probability: parseFloat(prob.toFixed(2)),
    }));

    // // Use datetime_taken from ML API
    const datetime_taken = data.datetime_taken || "";

    // // Use prediction and confidence
    const bestpredicted = top5[0]?.class || "Unknown";
    const confidenceScore = top5[0]?.probability || 0;

    const bestfilterpredicted = data.filtered_prediction.label || "Unknown";

    const newClassification = new Classification({
      userId: userId,
      userName: userName,
      imageUrl: Currentimage.filename,
      allpredicted: allpredicted,
      allfilterpredicted: allfilterpredicted,
      top5: top5,
      bestpredicted: bestpredicted,
      confidenceScore: confidenceScore,
      bestfilterpredicted: bestfilterpredicted,
      latitude: latitude,
      longitude: longitude,
      datetime_taken: datetime_taken,
      process_time: data.process_time,
    });

    const totalHistories = await Classification.countDocuments();

    const newHistoryStat = new HistoryClassificationStat({
      totalHistories: totalHistories,
      updatedAt: new Date(),
    });

    await newHistoryStat.save();

    // Save to database
    await newClassification.save();

    res
      .status(200)
      .json({ message: "Image uploadded successfully", result: data });
  } catch (error) {
    console.error("Error in uploadImages:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files;

    const metadata = JSON.parse(req.body.metadata);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (files.length !== metadata.length) {
      return res.status(400).json({
        message: "Number of files and metadata entries don't match",
      });
    }

    const result = await Promise.all(
      files.map(async (file, index) => {
        try {
          const base64Image = fs.readFileSync(file.path, {
            encoding: "base64",
          });

          const payload = {
            image: base64Image,
            Petiole_color: metadata[index].Petiole_color,
            Aerial_Tuber: metadata[index].Aerial_Tuber,
            Petiolar_base_color: metadata[index].Petiolar_base_color,
            Stem_Type: metadata[index].Stem_Type,
            Thorns: metadata[index].Thorns,
            Color_leaf_base: metadata[index].Color_leaf_base,
            Stem_Color: metadata[index].Stem_Color,
            Phyllotaxy: metadata[index].Phyllotaxy,
            Petiole_apex_color: metadata[index].Petiole_apex_color,
          };

          const response = await axios.post(
            `${process.env.ML_URL}/predict`,
            payload
          );

          const data = response.data;

          // Handle GPS data
          const latitude = !data.gps?.latitude
            ? "18.796143"
            : data.gps.latitude;
          const longitude = !data.gps?.longitude
            ? "98.979263"
            : data.gps.longitude;

          const allpredicted = Object.entries(data.all_class_probabilities).map(
            ([className, prob]) => ({
              class: className,
              probability: parseFloat(prob.toFixed(2)),
            })
          );

          const allfilterpredicted = data.filtered_species_list.map(
            (className) => ({
              class: className,
            })
          );

          const top5 = data.top5_predictions.map(([className, prob]) => ({
            class: className,
            probability: parseFloat(prob.toFixed(2)),
          }));

          const datetime_taken = data.datetime_taken || "";

          const bestpredicted = top5[0]?.class || "Unknown";
          const confidenceScore = top5[0]?.probability || 0;

          const bestfilterpredicted =
            data.filtered_prediction.label || "Unknown";

          const newClassification = new Classification({
            userId: metadata[index].userId,
            userName: metadata[index].userName,
            imageUrl: file.filename,
            allpredicted: allpredicted,
            allfilterpredicted: allfilterpredicted,
            top5: top5,
            bestpredicted: bestpredicted,
            confidenceScore: confidenceScore,
            bestfilterpredicted: bestfilterpredicted,
            latitude: latitude,
            longitude: longitude,
            datetime_taken: datetime_taken,
            process_time: data.process_time,
          });

          await newClassification.save();

          const totalHistories = await Classification.countDocuments();
          await new HistoryClassificationStat({
            totalHistories,
            updatedAt: new Date(),
          }).save();

          return newClassification;
        } catch (error) {
          console.error(`Error processing file ${index}:`, error);
          throw error;
        }
      })
    );

    console.log(result);

    res
      .status(200)
      .json({ message: "All image uploaded successfully", result: result });
  } catch (error) {
    console.log("Error in uploadMultipleImages controller: ", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};
