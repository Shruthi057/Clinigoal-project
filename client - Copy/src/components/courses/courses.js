import React from 'react';
import { Link } from 'react-router-dom';
// import './courses.css';

const CoursesPage = () => {
  const courses = [
    {
      id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "6 Months",
      level: "Advanced",
      color: "#2563eb"
    },
    {
      id: 2,
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research.",
      image: "https://images.unsplash.com/photo-1579165460885-f4de5a0ad776?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "8 Months",
      level: "Intermediate",
      color: "#10b981"
    },
    {
      id: 3,
      title: "Medical Coding",
      description: "Learn accurate medical coding for healthcare billing and insurance claims.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "4 Months",
      level: "Beginner",
      color: "#8b5cf6"
    },
    {
      id: 4,
      title: "Pharmacovigilance",
      description: "Specialized training in drug safety monitoring and adverse event reporting.",
      image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "5 Months",
      level: "Intermediate",
      color: "#f59e0b"
    }
  ];

  return (
    <div className="courses-page">
      <div className="container">
        <div className="courses-header">
          <h1>Our Courses</h1>
          <p>Explore our comprehensive range of healthcare courses designed to advance your career</p>
        </div>
        
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                <img src={course.image} alt={course.title} />
                <div className="course-badge" style={{ backgroundColor: course.color }}>
                  {course.level}
                </div>
              </div>
              <div className="course-content">
                <div className="course-meta">
                  <span className="duration">⏱️ {course.duration}</span>
                  <span className="level">{course.level}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-actions">
                  <Link to={`/courses/${course.id}`} className="btn-primary">View Details</Link>
                  <Link to={`/enroll/${course.id}`} className="btn-secondary">Enroll Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;