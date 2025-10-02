const User = require("../models/User");
const bcrypt = require("bcryptjs");

// C - Create User
const createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      fullName: fullName || "",
      avatarUrl: avatarUrl || "",
      role,
    });

    await user.save();

    // Populate role info
    await user.populate("role", "name description");

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// R - Get All Users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, username, fullName } = req.query;
    const skip = (page - 1) * limit;

    // Build query - chỉ lấy các user chưa bị xóa
    let query = { isDelete: false };

    // Tìm kiếm theo username (chứa)
    if (username) {
      query.username = { $regex: username, $options: "i" };
    }

    // Tìm kiếm theo fullName (chứa)
    if (fullName) {
      query.fullName = { $regex: fullName, $options: "i" };
    }

    const users = await User.find(query, { password: 0 }) // Loại bỏ password
      .populate("role", "name description")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// R - Get User by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne(
      { _id: id, isDelete: false },
      { password: 0 }
    ).populate("role", "name description");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// R - Get User by Username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne(
      { username: username, isDelete: false },
      { password: 0 }
    ).populate("role", "name description");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// U - Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDelete: false },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("role", "name description")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// D - Soft Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Hàm xác thực và chuyển status về true
const verifyAndActivateUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Email and username are required",
      });
    }

    // Tìm user với email và username khớp
    const user = await User.findOne({
      email: email,
      username: username,
      isDelete: false,
    }).populate("role", "name description");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with provided email and username",
      });
    }

    // Nếu đã active rồi
    if (user.status === true) {
      return res.json({
        success: true,
        message: "User is already activated",
        data: {
          username: user.username,
          email: user.email,
          status: user.status,
        },
      });
    }

    // Chuyển status về true
    user.status = true;
    await user.save();

    res.json({
      success: true,
      message: "User activated successfully",
      data: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  verifyAndActivateUser,
};
