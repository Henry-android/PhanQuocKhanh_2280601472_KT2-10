const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

// C - Create Role
router.post("/", createRole);

// R - Read Routes
router.get("/", getAllRoles); // Get all roles with search
router.get("/:id", getRoleById); // Get role by ID

// U - Update Role
router.put("/:id", updateRole);

// D - Delete Role (soft delete)
router.delete("/:id", deleteRole);

module.exports = router;
