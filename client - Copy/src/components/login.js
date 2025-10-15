import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackUserLogin } from "../utils/userTracking"; // CORRECT PATH
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "" 
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    // Track user login
    trackUserLogin({
      email: formData.email,
      name: formData.email.split('@')[0] // Use email prefix as name
    });

    // Store login status
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userName', formData.email.split('@')[0]);
    
    // Navigate to dashboard
    navigate("/user-dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back!</h2>
        <p className="login-subtitle">Login to continue to Clinigoal</p>

        <form onSubmit={handleSubmit}>
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
          />
          
          {/* Forgot Password Link */}
          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-btn">
            Login
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