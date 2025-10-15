import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

import HomePage from "./components/home/home";
import SignUpPage from "./components/signup/signup";
import LoginPage from "./components/login/login";
import Header from "./components/layout/header/header";
import AdminLogin from "./components/adminlogin/adminlogin";
import AdminDashboard from "./components/admindashboard/admindashboard";
import CoursesPage from "./components/courses/courses";
import CourseDetail from "./components/courses/CourseDetail";
import EnrollPage from "./components/courses/Enroll";
import UserDashboard from "./components/userdashboard/userdashboard";

// 🆕 Import Forgot Password component
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

function App() {
  // Initialize user tracking on app start
  useEffect(() => {
    console.log("Clinigoal App initialized");
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          {/* 🆕 Forgot Password Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Course Routes */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/enroll/:id" element={<EnrollPage />} />

          {/* Dashboard Routes */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/:tab" element={<AdminDashboard />} />

          {/* 404 Not Found Route */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <a href="/" className="home-link">
                  Go Back Home
                </a>
              </div>
            }
          />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              {/* Company Info */}
              <div className="footer-section">
                <div className="footer-logo">
                  <h3>Clinigoal</h3>
                </div>
                <p className="footer-description">
                  Advancing healthcare education through specialized courses and expert
                  instruction. Empowering healthcare professionals worldwide.
                </p>
              </div>

              {/* Quick Links */}
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul className="footer-links">
                  <li><a href="/">Home</a></li>
                  <li><a href="/#courses">Courses</a></li>
                  <li><a href="/#features">Why Choose Us</a></li>
                  <li><a href="/#testimonials">Testimonials</a></li>
                  <li><a href="/signup">Sign Up</a></li>
                </ul>
              </div>

              {/* Courses */}
              <div className="footer-section">
                <h4>Our Courses</h4>
                <ul className="footer-links">
                  <li><a href="/courses/1">Clinical Research</a></li>
                  <li><a href="/courses/2">Bioinformatics</a></li>
                  <li><a href="/courses/3">Medical Coding</a></li>
                  <li><a href="/courses/4">Pharmacovigilance</a></li>
                  <li><a href="/courses">All Courses</a></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="footer-section">
                <h4>Contact Us</h4>
                <div className="contact-info">
                  <div>
                    <span>📧</span>{" "}
                    <a href="mailto:info@clinigoal.com">info@clinigoal.com</a>
                  </div>
                  <div>
                    <span>🔗</span>{" "}
                    <a
                      href="http://linkedin.com/in/shruthi-l-b56774336"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                  <div>
                    <span>📍</span> 123 Healthcare Ave, Education City
                  </div>
                  <div>
                    <span>🕒</span> Mon - Fri: 9AM - 6PM
                  </div>
                </div>
              </div>
            </div>

            {/* Footer bottom section removed */}
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;