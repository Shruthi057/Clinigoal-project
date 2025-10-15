import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackUserLogin } from "../../utils/userTracking";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log("Login data:", formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Track user login
      const userData = {
        email: formData.email,
        name: formData.email.split('@')[0], // Use email prefix as name
        userId: `user_${Date.now()}`,
        loginTime: new Date().toISOString()
      };
      
      trackUserLogin(userData);

      // Store user data in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.email.split('@')[0]);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      console.log("✅ Login successful, navigating to dashboard...");
      
      // Navigate to dashboard
      navigate("/user-dashboard");

    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Login to continue to Clinigoal</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && !formData.email ? "error" : ""}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && !formData.password ? "error" : ""}
              minLength="6"
            />
          </div>
          
          {/* Forgot Password Link */}
          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`login-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}