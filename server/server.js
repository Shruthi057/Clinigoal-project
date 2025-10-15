import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if needed)
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS; // Gmail app password or service password

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Clinigoal Backend is running!");
});

// Example API route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Test route working!" });
});

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email transporter error:", error);
    } else {
      console.log("✅ Email transporter ready");
    }
  });
} catch (err) {
  console.error("❌ Email transporter setup failed:", err);
}

// Example function to send OTP
export const sendOTP = async (to, otp) => {
  if (!transporter) {
    console.log(`📧 OTP for ${to}: ${otp}`);
    return;
  }

  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send error:", err);
    console.log(`📧 OTP for ${to}: ${otp}`);
  }
};

// Create required directories
import fs from "fs";
const uploadsDir = path.join(process.cwd(), "uploads");
const publicDir = path.join(process.cwd(), "public");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
