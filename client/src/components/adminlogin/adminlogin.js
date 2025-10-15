import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./adminlogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <span className="admin-icon">🛡️</span>
          </div>
          <h2>{showRegister ? "Register" : showForgot ? "Reset Password" : "Admin Login"}</h2>
        </div>

        {!showRegister && !showForgot && (
          <>
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Login"}
              </button>
            </form>
            
            <div className="admin-links">
              <button onClick={() => setShowRegister(true)} className="link-btn">Create Account</button>
              <button onClick={() => setShowForgot(true)} className="link-btn">Forgot Password?</button>
            </div>
          </>
        )}

        {showRegister && (
          <>
            <form onSubmit={handleRegister} className="admin-login-form">
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Register"}
              </button>
            </form>
            
            <button onClick={() => setShowRegister(false)} className="link-btn back-btn">
              <span className="back-icon">←</span> Back to Login
            </button>
          </>
        )}

        {showForgot && (
          <>
            <form onSubmit={handleForgot} className="admin-login-form">
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner"></span> : "Reset Link"}
              </button>
            </form>
            
            <button onClick={() => setShowForgot(false)} className="link-btn back-btn">
              <span className="back-icon">←</span> Back to Login
            </button>
          </>
        )}

        <div className="admin-login-footer">
          <Link to="/" className="home-link">
            <span className="home-icon">🏠</span> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;