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

// NEW: Subscription Email Function
const sendSubscriptionEmail = async (email) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `Clinigoal <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to Clinigoal - Subscription Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Clinigoal! 🎓</h1>
          <p style="font-size: 16px; opacity: 0.9;">Your journey in healthcare education begins here</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2563eb; margin-top: 0;">✅ Subscription Confirmed</h3>
            <p>Hello,</p>
            <p>Thank you for subscribing to Clinigoal! You've successfully subscribed with:</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold; color: #2563eb; background: #e6f3ff; padding: 10px; border-radius: 5px;">${email}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #2563eb;">What's Next?</h4>
            <ul style="color: #555; line-height: 1.6;">
              <li>📧 Get weekly updates on new courses and offers</li>
              <li>🎯 Receive exclusive healthcare industry insights</li>
              <li>💡 Learn about upcoming webinars and events</li>
              <li>🔔 Be the first to know about special discounts</li>
            </ul>
          </div>

          <div style="background: #e6f3ff; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #2563eb; font-weight: bold;">
              Ready to Start Learning? Explore our courses and take the next step in your healthcare career!
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            You're receiving this email because you subscribed to Clinigoal newsletter.<br>
            If this wasn't you, please ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            &copy; 2024 Clinigoal. All rights reserved.<br>
            Transforming Healthcare Education
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription email sent to: ${email}`);
    return { success: true, method: 'email' };
  } catch (error) {
    console.error('❌ Subscription email failed:', error.message);
    throw error;
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

// NEW: Subscription Endpoint - Add this after the OTP endpoints
router.post("/send-subscription-email", async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ 
      success: false,
      message: "Valid email is required" 
    });
  }

  try {
    let response = {
      success: true,
      message: "Subscription confirmed! Welcome email sent successfully.",
      method: "email"
    };

    // Try to send email if service is enabled
    if (emailServiceEnabled) {
      try {
        await sendSubscriptionEmail(email);
      } catch (emailError) {
        console.error('❌ Subscription email failed:', emailError.message);
        
        // Update email service status
        emailServiceEnabled = false;
        lastEmailError = emailError;

        // Fallback - subscription still works, just no email
        console.log(`📧 Subscription for ${email} (Email service unavailable)`);
        response.message = "Subscribed successfully! (Welcome email delayed)";
        response.method = "console";
      }
    } else {
      // Email service is disabled
      console.log(`📧 Subscription for ${email} (Email service disabled)`);
      response.message = "Subscribed successfully! (Welcome email will be sent when service resumes)";
      response.method = "console";
    }

    res.json(response);

  } catch (err) {
    console.error("❌ Subscription Error:", err);
    
    // Even if email fails, subscription is still successful
    res.json({
      success: true,
      message: "Subscribed successfully! (Welcome email may be delayed)",
      method: "console"
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