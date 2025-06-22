// Import_DB
const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

exports.signup = async (req, res) => {
  try {
    const { name, email, role, password, confirmPassword } = req.body;
    // Check Required
    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All feilds are reuired" });
    // Check Email
    const existimgEmail = await User.findOne({ email });
    if (existimgEmail)
      return res.status(400).json({ message: "Email already exists" });

    // Check Username
    const existingName = await User.findOne({ name });
    if (existingName)
      return res.status(400).json({ message: "Username already exists" });

    // Normalize Role to Uppercase
    const normalizedRole = role ? role.toUpperCase() : "USER";

    // Validate Role
    if (normalizedRole !== "USER" && normalizedRole !== "ADMIN") {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (password !== confirmPassword)
      // Confirm password
      return res.status(400).json({ message: "Password is not match" });

    // Check length password
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    // Check Password Strength (Uppercase & Number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password))
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter and one number",
      });

    // hashPassword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save User to db
    const user = new User({
      name,
      email,
      role: normalizedRole,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "Signed up successfully", user });

    // todo: send welcome email
  } catch (error) {
    console.log("Error in sign uo controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.bulkSignup = async (req, res) => {
  try {
    const { users } = req.body;

    // Validate input
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }

    // Validate each user
    const usersToInsert = [];
    for (const user of users) {
      const { name, email, role, password, confirmPassword } = user;

      if (!name || !email || !password || !confirmPassword) {
        return res
          .status(400)
          .json({ message: "All fields are required for each user" });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: `Email already exists: ${email}` });
      }

      // Check if username already exists
      const existingName = await User.findOne({ name });
      if (existingName) {
        return res
          .status(400)
          .json({ message: `Username already exists: ${name}` });
      }

      // Normalize role
      const normalizedRole = role ? role.toUpperCase() : "USER";
      if (normalizedRole !== "USER" && normalizedRole !== "ADMIN") {
        return res
          .status(400)
          .json({ message: `Invalid role provided for user: ${name}` });
      }

      // Validate password
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ message: `Passwords do not match for user: ${name}` });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: `Password must be at least 6 characters for user: ${name}`,
        });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: `Password must contain at least one uppercase letter and one number for user: ${name}`,
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Add user to the array for bulk insertion
      usersToInsert.push({
        name,
        email,
        role: normalizedRole,
        password: hashedPassword,
      });
    }

    // Insert all users into the database
    const insertedUsers = await User.insertMany(usersToInsert);

    res.status(201).json({
      message: "Users signed up successfully",
      users: insertedUsers,
    });
  } catch (error) {
    console.log("Error in bulkSignup controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create & send token
    const token = jwt.sign(
      { userID: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await res.cookie("jwt-yamleaves", token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    });

    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Error in logged in controller!!", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt-yamleaves");
  res.json({ message: "Logged out successfully" });
};

exports.getCurrentUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in getCurrentUser controller");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { _id } = req.params;

    const user = await User.findById(_id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUser controller", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

exports.getAllClient = async (req, res) => {
  try {
    const { name = "", limit = 10 } = req.query;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Build the query
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Find all users
    const users = await User.find(query)
      .select("-password ")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const totalRoleUser = await User.countDocuments({role: "USER"})
    const totalRoleAdmin = await User.countDocuments({role: "ADMIN"})

    const response = {
      totalUsers,
      totalRoleUser,
      totalRoleAdmin,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit,
      users,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error in getAllUsers controller", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { _id } = req.params;
    const profilePic = req.file;
    const {
      name,
      email,
      role,
      position,
      department,
      organization,
      work_address,
      phone_number,
    } = req.body;

    // Check if user exists
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If Data are provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (position) user.position = position;
    if (department) user.department = department;
    if (organization) user.organization = organization;
    if (work_address) user.work_address = work_address;

    if (phone_number) {
      const digits = phone_number.replace(/\D/g, "");
      if (digits.length === 10) {
        user.phone_number = digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      } else {
        user.phone_number = phone_number; 
      }
    }

    if (profilePic) {
      if (user.profilePic) {
        const oldProfilePath = path.join(
          __dirname,
          "../uploads",
          user.profilePic
        );
        fs.unlink(oldProfilePath, (err) => {
          if (err) {
            console.error("Error deleting old image file:", err);
          }
        });
      }

      user.profilePic = profilePic.filename;
    }

    // Normalize Role to Uppercase
    const normalizedRole = role ? role.toUpperCase() : "USER";

    // Validate Role
    if (normalizedRole !== "USER" && normalizedRole !== "ADMIN") {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (normalizedRole) {
      user.role = normalizedRole;
    }

    // Save the Updates User
    const updateUser = await user.save();

    const { password: _, ...userWithoutPassword } = updateUser._doc;

    res
      .status(200)
      .json({ message: "User updated successfuly", user: userWithoutPassword });
  } catch (error) {
    console.log("Error on updateUser controller!!", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.params;
    const profilePic = req.file;

    console.log(profilePic);

    if (!profilePic)
      return res.status(404).json({ message: "Profile picture are required" });

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (profilePic) {
      // Delete the old image if it exists
      if (user.profilePic) {
        const oldImagePath = path.resolve(
          __dirname,
          "../uploads",
          user.profilePic
        );
        fs.access(oldImagePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldImagePath, (err) => {
              if (err) console.error("Error deleting old image:", err);
            });
          }
        });
      }

      // Save new filename
      user.profilePic = profilePic.filename;
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log("Error on updateProfile controller!!", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { _id } = req.params;

    // Check role ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can delete" });
    }

    // Check And Delete User
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error on searchUser controller!!", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { name = "", page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!name.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const query = {
      name: { $regex: name, $options: "i" },
    };

    const [users, totalUsers] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error on searchUser controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
