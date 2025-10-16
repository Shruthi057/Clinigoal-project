import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userExists, setUserExists] = useState(null);
  const navigate = useNavigate();

  // Check if user exists
  const checkUser = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("https://clinigoal-server.onrender.com/api/auth/check-user", { email });
      setUserExists(response.data.exists);
      
      if (!response.data.exists) {
        setError("This email is not registered. Please register first.");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setError("Failed to check if user exists: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      console.log("Sending OTP to:", email);
      const response = await axios.post("https://clinigoal-server.onrender.com/api/auth/send-otp", { email });
      console.log("OTP response:", response.data);
      setSuccess(response.data.message);
      setStep(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error.response?.data?.error || error.message || "Error sending OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post("https://clinigoal-server.onrender.com/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccess(response.data.message);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.response?.data?.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    const password = prompt("Enter a password for registration:");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("https://clinigoal-server.onrender.com/api/auth/register", {
        email,
        password
      });
      setSuccess("User registered successfully. Now you can request an OTP.");
      setUserExists(true);
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Failed to register user: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {step === 1 && (
          <form className="forgot-form" onSubmit={sendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={checkUser}
                required
              />
              {userExists === false && (
                <div className="user-not-found">
                  <p>User not found. 
                    <button type="button" onClick={registerUser} className="register-btn">
                      Register Now
                    </button>
                  </p>
                </div>
              )}
            </div>
            <button type="submit" className="btn" disabled={loading || userExists === false}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-form" onSubmit={resetPassword}>
            <div className="form-group">
              <label htmlFor="otp">One-Time Password</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter the 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        
        <div className="info-text">
          <button onClick={goBack} className="back-btn">
            {step === 1 ? "Back to Login" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}