import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

const Dashboard = () => {
    // --- NEW: State to track if a result exists ---
    const [hasResult, setHasResult] = useState(false);
    const [lastResultInfo, setLastResultInfo] = useState({ assignments: 0, courses: 0 });

    useEffect(() => {
        const savedResult = localStorage.getItem('latestScheduleResult');
        if (savedResult) {
            setHasResult(true);
            const parsedResult = JSON.parse(savedResult);
            setLastResultInfo({
                assignments: parsedResult.successful_assignments || 0,
                courses: parsedResult.total_courses_processed || 0
            });
        }
    }, []);

    const ResultCard = () => (
        <Link to="/results" className="card card-link purple">
            <div className="card-icon-area">
                <span className="icon">📄</span>
            </div>
            <div className="card-content">
                <h3>View Last Result</h3>
                <p className="description">
                    {lastResultInfo.assignments} of {lastResultInfo.courses} courses were successfully assigned.
                </p>
                <span className="go-to-link">View Details →</span>
            </div>
        </Link>
    );

    const NoResultCard = () => (
        <div className="card card-disabled">
            <div className="card-icon-area">
                <span className="icon">📄</span>
            </div>
            <div className="card-content">
                <h3>View Last Result</h3>
                <p className="description">No schedule has been generated yet. Go to "Generate Schedule" to start.</p>
                <span className="go-to-link disabled-text">View Details →</span>
            </div>
        </div>
    );

    return (
        <>
            <header className="main-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin!</p>
            </header>

            <div className="cards-container">
                {/* Card 1: Lecture Hall Manager */}
                <Link to="/lecture-halls" className="card card-link blue">
                    <div className="card-icon-area"><span className="icon">🏛️</span></div>
                    <div className="card-content">
                        <h3>Lecture Hall Manager</h3>
                        <p className="description">Manage hall capacity, schedules, and add new halls.</p>
                        <span className="go-to-link">Go to Manager →</span>
                    </div>
                </Link>

                {/* Card 2: Generate Schedule */}
                <Link to="/generate-schedule" className="card card-link orange">
                    <div className="card-icon-area"><span className="icon">🚀</span></div>
                    <div className="card-content">
                        <h3>Generate Schedule</h3>
                        <p className="description">Use the AI engine to generate the master course schedule.</p>
                        <span className="go-to-link">Generate →</span>
                    </div>
                </Link>

                {/* Card 3: Upload Files */}
                <Link to="/upload-files" className="card card-link green">
                    <div className="card-icon-area"><span className="icon">📤</span></div>
                    <div className="card-content">
                        <h3>Upload Files</h3>
                        <p className="description">Manage data by uploading Excel files.</p>
                        <span className="go-to-link">Upload Files →</span>
                    </div>
                </Link>

                {/* --- UPDATED: Card 4 is now dynamic --- */}
                {hasResult ? <ResultCard /> : <NoResultCard />}
            </div>
        </>
    );
};

export default Dashboard;