import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config(); // ✅ Load .env variables

const router = express.Router();

// Temporary in-memory OTP store (you can use MongoDB if you prefer)
const otpStore = {};

// 1️⃣ Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes

    // ✅ Secure transporter using .env credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail from .env
        pass: process.env.EMAIL_PASS, // your App Password from .env
      },
    });

    const mailOptions = {
      from: `Clinigoal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Clinigoal Password Reset OTP",
      html: `
        <h2>🔐 Password Reset Request</h2>
        <p>Hello,</p>
        <p>Your OTP for password reset is: <b>${otp}</b></p>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <br/>
        <p>Regards,<br/>Clinigoal Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// 2️⃣ Verify OTP and reset password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "No OTP sent" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: "OTP expired" });
  if (parseInt(otp) !== record.otp) return res.status(400).json({ message: "Invalid OTP" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { $set: { password: hashedPassword } });

  delete otpStore[email];

  res.json({ message: "Password reset successful" });
});

export default router;
