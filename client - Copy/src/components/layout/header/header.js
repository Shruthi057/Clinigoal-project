import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home", id: "home" },
    { href: "#courses", label: "Courses", id: "courses" },
    // { href: "#features", label: "Why Us", id: "features" },
    // { href: "#testimonials", label: "Testimonials", id: "testimonials" }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-container">

          {/* Logo */}
          <div className="logo">
            <Link to="/" className="logo-link">
              <div className="logo-icon">🎓</div>
              <div className="logo-text">
                <span className="logo-main">Clinigoal</span>
                <span className="logo-sub">Education</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <div className="nav-links">
              {navItems.map((item) => (
                item.path ? (
                  <Link 
                    key={item.id}
                    to={item.path}
                    className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a 
                    key={item.id}
                    href={item.href}
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="nav-buttons">
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="btn btn-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn btn-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>

                  <Link 
                    to="/admin-login" 
                    className="btn btn-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>

                  <Link 
                    to="/signup" 
                    className="btn btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;