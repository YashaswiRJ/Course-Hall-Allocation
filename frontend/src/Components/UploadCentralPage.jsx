import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/UploadCentralPage.css'; 

const UploadCentralPage = () => {
  return (
    <>
      <header className="upload-center-header">
        <h1>File Upload Center</h1>
        <p>Select a category to upload your file.</p>
      </header>

      <div className="upload-cards-container">
        {/* Course Schedule Card */}
        <Link to="/upload/course-schedule" className="upload-card course">
          <div className="upload-card-icon">📄</div>
          <h3>Course Schedule</h3>
          <p className="description">Upload the master file containing all course and instructor details.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>

        {/* Constraint File Card -- UPDATED */}
        <Link to="/upload/constraints" className="upload-card constraint">
          <div className="upload-card-icon">⚙️</div>
          <h3>Pre-allocated Slots</h3>
          <p className="description">Upload a file with courses that are already assigned to a specific hall and time.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>

        {/* Forbidden Halls Card */}
        <Link to="/upload/forbidden-halls" className="upload-card forbidden">
          <div className="upload-card-icon">🚫</div>
          <h3>Forbidden Halls</h3>
          <p className="description">Upload constraints for courses that cannot be held in certain halls.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>
      </div>
    </>
  );
};

export default UploadCentralPage;