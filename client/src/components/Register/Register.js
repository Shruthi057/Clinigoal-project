import React, { useState } from "react";
import { Link } from "react-router-dom"; // If using React Router
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Registration:\nName: ${name}\nEmail: ${email}`);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn">Register</button>
        </form>
        
        {/* Add this section for the forgot password link */}
        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
          <p><Link to="/forgot-password">Forgot Password?</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;