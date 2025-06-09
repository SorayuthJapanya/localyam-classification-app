const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.log("Error in connectDB config:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };
