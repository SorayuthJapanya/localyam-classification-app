const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
    position: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    organization: {
      type: String,
      default: "",
    },
    work_address: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,
      match: [
        /^\d{3}-\d{3}-\d{4}$/,
        "Invalid phone number format (expected 123-456-7890)",
      ],
      max: 10,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
