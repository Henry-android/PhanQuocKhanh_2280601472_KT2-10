const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm
roleSchema.index({ name: 1 });
roleSchema.index({ isDelete: 1 });

module.exports = mongoose.model("Role", roleSchema);
