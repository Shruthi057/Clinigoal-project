import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./adminlogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/admin-dashboard"; // redirect to dashboard
    }, 1500);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Admin Registration submitted!");
    }, 1500);
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Password reset link sent to: ${email}`);
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <span className="admin-icon">🛡️</span>
          </div>
          <h2>{showRegister ? "Admin Registration" : showForgot ? "Reset Password" : "Admin Login"}</h2>
          <p>
            {showRegister 
              ? "Create your admin account" 
              : showForgot 
              ? "Enter your email to reset password"
              : "Access the admin dashboard"
            }
          </p>
        </div>

        {!showRegister && !showForgot && (
          <>
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn login-btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Sign In"}
              </button>
            </form>
            
            <div className="admin-links">
              <button onClick={() => setShowRegister(true)} className="link-btn">Create Admin Account</button>
              <button onClick={() => setShowForgot(true)} className="link-btn">Forgot Password?</button>
            </div>
          </>
        )}

        {showRegister && (
          <>
            <form onSubmit={handleRegister} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <div className="input-container">
                  <span className="input-icon">👤</span>
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="register-email">Email Address</label>
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn register-btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Create Account"}
              </button>
            </form>
            
            <div className="admin-links">
              <button onClick={() => setShowRegister(false)} className="link-btn back-btn">
                <span className="back-icon">←</span> Back to Login
              </button>
            </div>
          </>
        )}

        {showForgot && (
          <>
            <form onSubmit={handleForgot} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn reset-btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Send Reset Link"}
              </button>
            </form>
            
            <div className="admin-links">
              <button onClick={() => setShowForgot(false)} className="link-btn back-btn">
                <span className="back-icon">←</span> Back to Login
              </button>
            </div>
          </>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="home-link">
            <span className="home-icon">🏠</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;