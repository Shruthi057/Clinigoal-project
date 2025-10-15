// components/userdashboard/userdashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  return (
    <div style={{ 
      minHeight: '80vh', 
      padding: '100px 20px', 
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>
          Welcome back, {userName}!
        </h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          {userEmail}
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '40px'
        }}>
          <Link 
            to="/courses"
            style={{
              padding: '20px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#1e293b',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#4f46e5';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.color = '#1e293b';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            <h3>Browse Courses</h3>
            <p>Explore all available courses</p>
          </Link>

          <Link 
            to="/courses/1"
            style={{
              padding: '20px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#1e293b',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#4f46e5';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.color = '#1e293b';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            <h3>My Courses</h3>
            <p>View your enrolled courses</p>
          </Link>

          <Link 
            to="/"
            style={{
              padding: '20px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#1e293b',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#4f46e5';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.color = '#1e293b';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            <h3>Home</h3>
            <p>Return to homepage</p>
          </Link>
        </div>
      </div>
    </div>
  );
}