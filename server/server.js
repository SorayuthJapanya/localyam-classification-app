const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");

// Import
const { connectDB } = require("./config/connectDB");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const speciesRoutes = require("./routes/speciesRoutes");
const historyRoutes = require("./routes/historyRoutes");

//Config
dotenv.config();
const app = express();

// Variable
const PORT = process.env.PORT || 5001;

// Use
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
} else {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1/species", speciesRoutes);
app.use("/api/v1/history", historyRoutes);

// Server React

app.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port:", PORT);
});
