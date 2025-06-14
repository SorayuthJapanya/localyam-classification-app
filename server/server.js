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

const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://192.168.0.118:8080",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
};

app.use(cors(corsOptions));

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
