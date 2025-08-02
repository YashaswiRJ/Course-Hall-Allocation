import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

const Dashboard = () => {
    return (
        <>
            <header className="main-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin!</p>
            </header>

            <div className="cards-container">
                {/* Card 1: Lecture Hall Manager */}
                <Link to="/lecture-halls" className="card card-link blue">
                    <div className="card-icon-area">
                        <span className="icon">🏛️</span>
                    </div>
                    <div className="card-content">
                        <h3>Lecture Hall Manager</h3>
                        <p className="description">Manage hall capacity, schedules, and add new halls.</p>
                        <span className="go-to-link">Go to Manager →</span>
                    </div>
                </Link>

                {/* Card 2: Generate Schedule */}
                <Link to="/generate-schedule" className="card card-link orange">
                    <div className="card-icon-area">
                        <span className="icon">🚀</span>
                    </div>
                    <div className="card-content">
                        <h3>Generate Schedule</h3>
                        <p className="description">Use the AI engine to generate the master course schedule.</p>
                        <span className="go-to-link">Generate →</span>
                    </div>
                </Link>

                {/* Card 3: Upload Files */}
                <Link to="/upload-files" className="card card-link green">
                    <div className="card-icon-area">
                        <span className="icon">📤</span>
                    </div>
                    <div className="card-content">
                        <h3>Upload Files</h3>
                        <p className="description">Manage data by uploading Excel files.</p>
                        <span className="go-to-link">Upload Files →</span>
                    </div>
                </Link>

                {/* Card 4: Standard Info Card */}
                <div className="card">
                    <h3>Server Load</h3>
                    <p className="metric">34%</p>
                    <p className="description">Normal operating levels</p>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
