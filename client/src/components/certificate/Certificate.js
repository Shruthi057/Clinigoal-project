// components/Certificate.js
import React, { useState, useEffect } from "react";
import "./Certificate.css";

export default function Certificate({ courseId, courseTitle, onClose }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserCertificates();
  }, []);

  const fetchUserCertificates = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(`/api/certificate/user/${userEmail}`);
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const generateCertificate = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      
      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userEmail, // In real app, use user ID
          courseId: courseId
        }),
      });

      if (response.ok) {
        // Open PDF in new tab
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Refresh certificates list
        fetchUserCertificates();
      } else {
        alert("Failed to generate certificate");
      }
    } catch (error) {
      console.error("Certificate generation error:", error);
      alert("Error generating certificate");
    } finally {
      setLoading(false);
    }
  };

  const viewCertificate = (certificateId) => {
    window.open(`/api/certificate/generate?certificateId=${certificateId}`, '_blank');
  };

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-modal">
        <div className="certificate-header">
          <h2>Course Certificate</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="certificate-content">
          <div className="course-info">
            <h3>{courseTitle}</h3>
            <p>Congratulations on completing the course!</p>
          </div>

          <div className="certificate-actions">
            <button 
              className="generate-btn"
              onClick={generateCertificate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Download Certificate"}
            </button>
          </div>

          <div className="certificates-list">
            <h4>Your Certificates</h4>
            {certificates.length === 0 ? (
              <p className="no-certificates">No certificates generated yet</p>
            ) : (
              certificates.map(cert => (
                <div key={cert._id} className="certificate-item">
                  <div className="cert-info">
                    <strong>{cert.courseName}</strong>
                    <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                  <button 
                    className="view-btn"
                    onClick={() => viewCertificate(cert.certificateId)}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}