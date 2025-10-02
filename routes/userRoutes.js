const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  verifyAndActivateUser,
} = require("../controllers/userController");

// C - Create User
router.post("/", createUser);

// R - Read Routes
router.get("/", getAllUsers); // Get all users with search
router.get("/id/:id", getUserById); // Get user by ID
router.get("/username/:username", getUserByUsername); // Get user by username

// U - Update User
router.put("/:id", updateUser);

// D - Delete User (soft delete)
router.delete("/:id", deleteUser);

// Special route for verification and activation
router.post("/verify-activate", verifyAndActivateUser);

module.exports = router;
