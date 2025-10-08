import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [hasResult, setHasResult] = useState(false);
    const [lastResultInfo, setLastResultInfo] = useState({ assignments: 0, total: 0 });

    useEffect(() => {
        const savedAssignments = localStorage.getItem('latestAllocationResult');
        const savedUnallocated = localStorage.getItem('latestUnallocatedCourses');
        
        if (savedAssignments || savedUnallocated) {
            setHasResult(true);
            const assignments = savedAssignments ? JSON.parse(savedAssignments) : [];
            const unallocated = savedUnallocated ? JSON.parse(savedUnallocated) : [];
            setLastResultInfo({
                assignments: assignments.length,
                total: assignments.length + unallocated.length,
            });
        }
    }, []);

    const handleViewResultClick = () => {
        navigate('/results');
    };

    const ResultCard = () => (
        <div onClick={handleViewResultClick} className="card card-link purple" style={{cursor: 'pointer'}}>
            <div className="card-icon-area">
                <span className="icon">📄</span>
            </div>
            <div className="card-content">
                <h3>View Last Result</h3>
                <p className="description">
                    {lastResultInfo.assignments} of {lastResultInfo.total} courses were successfully assigned.
                </p>
                <span className="go-to-link">View Details →</span>
            </div>
        </div>
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
                <Link to="/lecture-halls" className="card card-link blue">
                    <div className="card-icon-area"><span className="icon">🏛️</span></div>
                    <div className="card-content">
                        <h3>Lecture Hall Manager</h3>
                        <p className="description">Manage hall capacity, schedules, and add new halls.</p>
                        <span className="go-to-link">Go to Manager →</span>
                    </div>
                </Link>

                <Link to="/generate-schedule" className="card card-link orange">
                    <div className="card-icon-area"><span className="icon">🚀</span></div>
                    <div className="card-content">
                        <h3>Generate Schedule</h3>
                        <p className="description">Use the AI engine to generate the master course schedule.</p>
                        <span className="go-to-link">Generate →</span>
                    </div>
                </Link>

                <Link to="/upload-files" className="card card-link green">
                    <div className="card-icon-area"><span className="icon">📤</span></div>
                    <div className="card-content">
                        <h3>Upload Files</h3>
                        <p className="description">Manage data by uploading Excel files.</p>
                        <span className="go-to-link">Upload Files →</span>
                    </div>
                </Link>

                {hasResult ? <ResultCard /> : <NoResultCard />}
            </div>
        </>
    );
};

export default Dashboard;