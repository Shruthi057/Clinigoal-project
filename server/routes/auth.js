import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config(); // ✅ Load .env variables

const router = express.Router();

// Temporary in-memory OTP store (you can use MongoDB if you prefer)
const otpStore = {};

// Email service status tracking
let emailServiceEnabled = true;
let lastEmailError = null;

// 1️⃣ Enhanced Email Transporter with better configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // ✅ Enhanced connection settings to prevent ECONNRESET
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 10,
    rateDelta: 1000,
    rateLimit: 5,
    secure: true, // Use TLS
    tls: {
      rejectUnauthorized: false // Helps with certificate issues
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    debug: process.env.NODE_ENV === 'development', // Enable debug in development
    logger: process.env.NODE_ENV === 'development' // Enable logger in development
  });
};

// 2️⃣ Health check for email service
const checkEmailHealth = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is healthy');
    emailServiceEnabled = true;
    return true;
  } catch (error) {
    console.error('❌ Email service health check failed:', error.message);
    emailServiceEnabled = false;
    lastEmailError = error;
    return false;
  }
};

// 3️⃣ Enhanced OTP sending with fallback
const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `Clinigoal <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Clinigoal Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔐 Password Reset Request</h2>
        <p>Hello,</p>
        <p>Your OTP for password reset is: <b style="font-size: 24px; color: #dc2626;">${otp}</b></p>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <br/>
        <p>If you didn't request this, please ignore this email.</p>
        <br/>
        <p>Regards,<br/><b>Clinigoal Team</b></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email}`);
    return { success: true, method: 'email' };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error; // Re-throw to handle in the main function
  }
};

// 4️⃣ Send OTP - Main endpoint with enhanced error handling
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = { 
      otp, 
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0 // Track OTP verification attempts
    };

    let response = {
      message: "OTP sent successfully",
      method: "email"
    };

    // Try to send email if service is enabled
    if (emailServiceEnabled) {
      try {
        await sendOTPEmail(email, otp);
      } catch (emailError) {
        console.error('❌ Primary email method failed:', emailError.message);
        
        // Update email service status
        emailServiceEnabled = false;
        lastEmailError = emailError;

        // Fallback to console logging
        console.log(`📧 OTP for ${email}: ${otp} (Email service unavailable)`);
        response.message = "OTP logged to console (Email service temporarily unavailable)";
        response.method = "console";
        response.otp = otp; // Include OTP in response for development
      }
    } else {
      // Email service is disabled, use console fallback
      console.log(`📧 OTP for ${email}: ${otp} (Email service disabled)`);
      response.message = "OTP logged to console (Email service unavailable)";
      response.method = "console";
      response.otp = otp; // Include OTP in response for development
    }

    res.json(response);

  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    
    // Determine appropriate error message
    let errorMessage = "Failed to send OTP";
    if (err.code === 'ECONNRESET') {
      errorMessage = "Email service connection failed. OTP has been logged to console.";
    } else if (err.responseCode === 535) {
      errorMessage = "Email authentication failed. Please check email credentials.";
    }

    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 5️⃣ Verify OTP and reset password with enhanced security
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Input validation
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  const record = otpStore[email];
  
  if (!record) {
    return res.status(400).json({ message: "No OTP sent for this email" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP has expired" });
  }

  // Track attempts to prevent brute force
  record.attempts = (record.attempts || 0) + 1;
  
  if (record.attempts > 5) {
    delete otpStore[email];
    return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
  }

  if (parseInt(otp) !== record.otp) {
    return res.status(400).json({ 
      message: "Invalid OTP", 
      attemptsRemaining: 5 - record.attempts 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12); // Increased salt rounds for better security
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    // Clean up OTP after successful use
    delete otpStore[email];

    console.log(`✅ Password reset successful for: ${email}`);
    res.json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("❌ Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// 6️⃣ Email service status endpoint (for monitoring)
router.get("/email-status", async (req, res) => {
  const health = await checkEmailHealth();
  res.json({
    emailServiceEnabled,
    lastError: lastEmailError?.message,
    timestamp: new Date().toISOString()
  });
});

// 7️⃣ Manual email service reset endpoint
router.post("/reset-email-service", async (req, res) => {
  const health = await checkEmailHealth();
  res.json({
    message: health ? "Email service restored" : "Email service still unavailable",
    emailServiceEnabled: health
  });
});

// 8️⃣ Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  Object.keys(otpStore).forEach(email => {
    if (otpStore[email].expiresAt < now) {
      delete otpStore[email];
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
  }
}, 10 * 60 * 1000); // Run every 10 minutes

// 9️⃣ Initial email service health check on startup
checkEmailHealth().then(health => {
  console.log(health ? '✅ Email service initialized successfully' : '❌ Email service initialization failed');
});

export default router;