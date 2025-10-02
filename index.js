require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "User Role API Server",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      roles: "/api/roles",
      health: "/api/health",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});
