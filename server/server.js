import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables
dotenv.config();

// Import configurations
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";
import { sanitizeInput } from "./middleware/validation.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import medicineRoutes from "./routes/medicines.js";
import orderRoutes from "./routes/orders.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import categoryRoutes from "./routes/categories.js";
import supplierRoutes from "./routes/suppliers.js";
import patientRoutes from "./routes/patients.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";
import auditLogRoutes from "./routes/auditLogs.js";
import supportRoutes from "./routes/support.js";
import clinicRoutes from "./routes/clinics.js";
import adminStatsRoutes from "./routes/adminStats.js";
import favoriteRoutes from "./routes/favorites.js";
import reviewRoutes from "./routes/reviews.js";
import homeMedicineRoutes from "./routes/homeMedicines.js";
import refillRoutes from "./routes/refills.js";
import aiRoutes from "./routes/ai.js";
import paymentRoutes from "./routes/payments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Trust Replit's reverse proxy so X-Forwarded-For is read correctly
app.set("trust proxy", 1);

// Initialize Socket.io
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads", "prescriptions");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: false,
  }),
);

// CORS configuration: allow Replit dev domains, localhost, and configured CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pharmacy-management-rho.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) with no origin
      if (!origin) return callback(null, true);
      // Allow any Replit dev domain
      if (origin && origin.endsWith('.replit.dev')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed by server'), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Handle preflight for all routes
app.options('/{*splat}', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin && origin.endsWith('.replit.dev')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  validate: { xForwardedForHeader: false },
});

// Apply rate limiting to auth routes
app.use("/api/auth", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Input sanitization
app.use(sanitizeInput);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/admin", adminStatsRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/home-medicines", homeMedicineRoutes);
app.use("/api/refills", refillRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Pharmacy Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Pharmacy Management System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      medicines: "/api/medicines",
      orders: "/api/orders",
      prescriptions: "/api/prescriptions",
      categories: "/api/categories",
      suppliers: "/api/suppliers",
      patients: "/api/patients",
      analytics: "/api/analytics",
      settings: "/api/settings",
      auditLogs: "/api/audit-logs",
      support: "/api/support",
    },
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     🏥 Pharmacy Management System API                    ║
  ║                                                           ║
  ║     Server running on: http://localhost:${PORT}             ║
  ║     Environment: ${process.env.NODE_ENV || "development"}                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  httpServer.close(() => process.exit(1));
});

export default app;
