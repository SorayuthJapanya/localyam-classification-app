const mongoose = require("mongoose");

const historyClassificationStatSchema = new mongoose.Schema(
  {
    totalHistories: {
      type: Number,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HistoryClassificationStat",
  historyClassificationStatSchema
);
