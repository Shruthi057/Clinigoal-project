// signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackUserLogin } from "../../utils/userTracking";
import "./signup.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-signup-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpModal(true);
        setMessage("OTP sent to your email!");
      } else {
        setMessage(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
     const response = await fetch(`${API_BASE_URL}/api/auth/verify-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Track user registration
        trackUserLogin({
          email: formData.email,
          name: formData.name,
        });

        // Store user data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userName", formData.name);

        setMessage("Account created successfully!");
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 1000);
      } else {
        setMessage(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setMessage("");

    try {
     const response = await fetch(`${API_BASE_URL}/api/auth/send-signup-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("New OTP sent to your email!");
      } else {
        setMessage(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p className="signup-subtitle">Join Clinigoal and start learning!</p>

        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSendOtp}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button 
            type="submit" 
            className="signup-btn"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="otp-modal-overlay">
            <div className="otp-modal">
              <h3>Verify Your Email</h3>
              <p>Enter the 6-digit OTP sent to {formData.email}</p>
              
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  required
                  className="otp-input"
                />
                
                <div className="otp-buttons">
                  <button 
                    type="submit" 
                    className="verify-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  
                  <button 
                    type="button" 
                    className="resend-btn"
                    onClick={resendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
              
              <button 
                className="close-modal"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>

        <p className="forgot-text">
          Forgot your password?{" "}
          <Link to="/forgot-password" className="forgot-link">
            Reset here
          </Link>
        </p>
      </div>
    </div>
  );
}