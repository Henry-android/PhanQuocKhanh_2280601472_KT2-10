require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Role = require("./models/Role");

const seedDatabase = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Xóa dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Tạo roles mẫu
    const adminRole = await Role.create({
      name: "Admin",
      description: "Administrator role with full access",
    });

    const userRole = await Role.create({
      name: "User",
      description: "Regular user role with limited access",
    });

    const moderatorRole = await Role.create({
      name: "Moderator",
      description: "Moderator role with moderate access",
    });

    console.log("Created sample roles");

    // Tạo users mẫu
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = [
      {
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        fullName: "System Administrator",
        status: true,
        role: adminRole._id,
        loginCount: 5,
      },
      {
        username: "john_doe",
        password: hashedPassword,
        email: "john.doe@example.com",
        fullName: "John Doe",
        status: false,
        role: userRole._id,
        loginCount: 0,
      },
      {
        username: "jane_smith",
        password: hashedPassword,
        email: "jane.smith@example.com",
        fullName: "Jane Smith",
        status: true,
        role: moderatorRole._id,
        loginCount: 3,
      },
      {
        username: "bob_wilson",
        password: hashedPassword,
        email: "bob.wilson@example.com",
        fullName: "Bob Wilson",
        status: false,
        role: userRole._id,
        loginCount: 0,
      },
    ];

    await User.insertMany(users);
    console.log("Created sample users");

    console.log("Database seeded successfully!");
    console.log("\nSample data:");
    console.log("Roles:", await Role.find({}, "name description"));
    console.log(
      "Users:",
      await User.find({}, "username email fullName status").populate(
        "role",
        "name"
      )
    );

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
