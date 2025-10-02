const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ fullName: 1 });
userSchema.index({ isDelete: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);
