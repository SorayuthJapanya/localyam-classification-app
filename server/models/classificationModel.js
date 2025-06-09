const mongoose = require("mongoose");
const { type } = require("os");

const classificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    allpredicted: [
      {
        class: { type: String, required: true },
        probability: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    allfilterpredicted: [
      {
        class: { type: String, required: true },
      },
    ],
    top5: [
      {
        class: { type: String, required: true },
        probability: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    bestpredicted: {
      type: String,
      required: true,
    },
    bestfilterpredicted: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    latitude: {
      type: String,
      default: "18.796143",
    },
    longitude: {
      type: String,
      default: "98.979263",
    },
    datetime_taken: {
      type: String,
      default: "",
    },
    process_time: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classification", classificationSchema);
