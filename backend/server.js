const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Heartbeat to keep process alive
setInterval(() => {
  // console.log('Heartbeat...');
}, 10000);

// Create HTTP server explicitly
const server = require('http').createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => {
  console.error("MongoDB connection error (initial):", err.message);
  console.log("Starting in fallback mode (JSON storage enabled)");
});

mongoose.connection.on('error', err => {
  console.error("MongoDB connection event error:", err.message);
});

// Routes
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/clinic", require("./routes/clinicRoutes"));

// Sample route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});
