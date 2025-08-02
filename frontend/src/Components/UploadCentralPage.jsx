import React from 'react';
import { Link } from 'react-router-dom';
// We can reuse the dashboard's CSS for a consistent look
import '../Styles/Dashboard.css'; 

const UploadCentralPage = () => {
  return (
    <>
      <header className="main-header">
        <h1>File Upload Center</h1>
        <p>Select a category to upload your file.</p>
      </header>

      <div className="cards-container">
        <Link to="/upload/course-schedule" className="card card-link green">
          <h3>Course Schedule</h3>
          <p className="description">Upload the master file containing all course and instructor details.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>

        <Link to="/upload/constraints" className="card card-link green">
          <h3>Constraint File</h3>
          <p className="description">Upload the file defining specific constraints for scheduling.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>

        <Link to="/upload/forbidden-halls" className="card card-link green">
          <h3>Forbidden Halls</h3>
          <p className="description">Upload constraints for courses that cannot be held in certain halls.</p>
          <span className="go-to-link">Upload File →</span>
        </Link>
      </div>
    </>
  );
};

export default UploadCentralPage;
