// Load environment variables
import 'dotenv/config';
console.log("Starting server...");
console.log("Hugging Face API Key:", process.env.HUGGING_FACE_API_KEY ? "Set" : "Not set");

// Third-party modules
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import multer from "multer";

// Initialize Express
const app = express();
const upload = multer({ dest: "uploads/" });

// Enable CORS
app.use(cors({
  origin: true, // or specify frontend URL like "http://localhost:5173"
  credentials: true
}));

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate required environment variables BEFORE connecting to DB
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI environment variable is not set");
  console.error("Please create a .env file in the server directory with MONGO_URI");
  console.error("Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is not set");
  console.error("Please create a .env file in the server directory with JWT_SECRET");
  console.error("You can generate one using: node generate-jwt-secret.js");
  process.exit(1);
}

// Connect to MongoDB
connectDB()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("WARNING: SMTP configuration is missing. Email functionality may not work.");
  console.warn("OTP codes will be logged to console in development mode.");
}

// Routes
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/contact", contactRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});
