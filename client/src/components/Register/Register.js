import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a course was selected from the home page
    const courseData = localStorage.getItem('selectedCourse');
    if (courseData) {
      setSelectedCourse(JSON.parse(courseData));
      // Clear the stored course data after reading it
      localStorage.removeItem('selectedCourse');
    }
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Store user data in localStorage
    const userData = {
      name,
      email,
      password,
      registeredCourse: selectedCourse,
      registrationDate: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingUsers = JSON.parse(localStorage.getItem('clinigoalUsers') || '[]');
    existingUsers.push(userData);
    localStorage.setItem('clinigoalUsers', JSON.stringify(existingUsers));
    
    // Store email for reviews system
    const userEmails = JSON.parse(localStorage.getItem('userEmails') || '[]');
    if (!userEmails.includes(email)) {
      userEmails.push(email);
      localStorage.setItem('userEmails', JSON.stringify(userEmails));
    }
    
    alert(`Registration Successful!\nName: ${name}\nEmail: ${email}\nCourse: ${selectedCourse ? selectedCourse.title : 'Not selected'}`);
    
    // Redirect to login page after successful registration
    navigate('/login');
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register for Clinigoal</h2>
        
        {selectedCourse && (
          <div className="selected-course-info">
            <h3>Selected Course:</h3>
            <div className="course-details">
              <strong>{selectedCourse.title}</strong>
              <p>{selectedCourse.description}</p>
              <div className="course-price">{selectedCourse.price}</div>
            </div>
          </div>
        )}
        
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              placeholder="Create a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Create Account
          </button>
        </form>
        
        {!selectedCourse && (
          <div className="browse-courses-section">
            <p>Haven't selected a course yet?</p>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleBrowseCourses}
            >
              Browse All Courses
            </button>
          </div>
        )}
        
        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <p><Link to="/forgot-password">Forgot Password?</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;