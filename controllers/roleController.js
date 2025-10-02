const Role = require("../models/Role");

// C - Create Role
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = new Role({
      name,
      description: description || "",
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Role name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// R - Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const skip = (page - 1) * limit;

    // Build query - chỉ lấy các role chưa bị xóa
    let query = { isDelete: false };

    // Tìm kiếm theo name (chứa)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    const roles = await Role.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Role.countDocuments(query);

    res.json({
      success: true,
      data: roles,
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

// R - Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({ _id: id, isDelete: false });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// U - Update Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findOneAndUpdate(
      { _id: id, isDelete: false },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Role name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// D - Soft Delete Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
