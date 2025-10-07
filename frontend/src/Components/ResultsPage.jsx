import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import '../Styles/ResultsPage.css';

const ResultsPage = () => {
    const location = useLocation();
    const scheduleData = location.state?.schedule;

    // --- State Hooks ---
    const [viewMode, setViewMode] = useState('room');
    const [searchTerm, setSearchTerm] = useState(''); // For Course View
    const [selectedHall, setSelectedHall] = useState('all'); // For Course View
    // REMOVED: selectedDay state is no longer needed
    const [roomSearchTerm, setRoomSearchTerm] = useState(''); // For Room View Search
    const [currentPage, setCurrentPage] = useState(1);
    const assignmentsPerPage = 20;

    // Save allocation results to localStorage
    useEffect(() => {
        if (scheduleData && scheduleData['Allocation Result']) {
            localStorage.setItem('latestAllocationResult', JSON.stringify(scheduleData['Allocation Result']));
        }
    }, [scheduleData]);

    const assignments = useMemo(() => scheduleData?.['Allocation Result']|| [], [scheduleData]);

    // Get master list of all halls from localStorage
    const allUniqueHalls = useMemo(() => {
        try {
            const storedHalls = localStorage.getItem('allLectureHalls');
            if (storedHalls) {
                const parsedHalls = JSON.parse(storedHalls);
                if (Array.isArray(parsedHalls) && parsedHalls.length > 0) {
                    return parsedHalls.map(hall => hall.name).sort();
                }
            }
        } catch (error) {
            console.error("Failed to parse lecture halls from localStorage:", error);
        }
        console.warn("Falling back to deriving hall list from allocation results.");
        const hallSet = new Set();
        assignments.forEach(item => {
            if (item['Lecture Hall Allocated']) {
                item['Lecture Hall Allocated'].split(',').forEach(hall => hallSet.add(hall.trim()));
            }
        });
        return Array.from(hallSet).sort();
    }, [assignments]);

    // Data grouping for Room View
    const allocationsByRoom = useMemo(() => {
        const acc = {};
        assignments.forEach(item => {
            const hallNames = item['Lecture Hall Allocated']?.split(',') || [];
            hallNames.forEach(hallName => {
                const trimmedName = hallName.trim();
                if (!acc[trimmedName]) {
                    acc[trimmedName] = [];
                }
                acc[trimmedName].push(item);
            });
        });
        return acc;
    }, [assignments]);

    // Filtering for "Course View"
    const filteredAssignments = useMemo(() => {
        return assignments.filter(item => {
            if (!item['Course Name'] || !item['Course Code'] || !item['Lecture Hall Allocated'] || !item.Schedule) return false;
            
            const normalizedSearch = searchTerm.toLowerCase();
            const courseMatch = item['Course Name'].toLowerCase().includes(normalizedSearch) ||
                                item['Course Code'].toLowerCase().includes(normalizedSearch);
            
            const hallMatch = selectedHall === 'all' || item['Lecture Hall Allocated'].split(',').map(h => h.trim()).includes(selectedHall);
            
            // REMOVED: dayMatch logic is no longer needed
            return courseMatch && hallMatch;
        });
    }, [assignments, searchTerm, selectedHall]);

    if (!scheduleData || !scheduleData['Allocation Result']) {
        return <Navigate to="/" replace />;
    }

    // Pagination for Course View
    const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const currentAssignments = filteredAssignments.slice((currentPage - 1) * assignmentsPerPage, currentPage * assignmentsPerPage);
    const totalCourses = assignments.length;

    // Filtered list of halls for the Room View search bar
    const filteredHalls = allUniqueHalls.filter(hall =>
        hall.toLowerCase().includes(roomSearchTerm.toLowerCase())
    );

    return (
        <div className="results-page-container">
            <header className="main-header">
                <h1>Schedule Generated Successfully!</h1>
                <p>Review the detailed course allocations below.</p>
            </header>

            <div className="summary-card">
                <h3>Summary</h3>
                <div className="summary-stats">
                    <div className="stat-item">
                        <span className="stat-value">{totalCourses}</span>
                        <span className="stat-label">Courses Processed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{totalCourses}</span>
                        <span className="stat-label">Successful Assignments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Unassigned Courses</span>
                    </div>
                </div>
            </div>

            <div className="assignments-card">
                <div className="card-header">
                    <h3>Detailed Assignments</h3>
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'course' ? 'active' : ''}
                            onClick={() => setViewMode('course')}
                        >
                            Course View
                        </button>
                        <button
                            className={viewMode === 'room' ? 'active' : ''}
                            onClick={() => setViewMode('room')}
                        >
                            Room View
                        </button>
                    </div>
                </div>

                {viewMode === 'course' && (
                    <div id="course-view">
                        <div className="filter-controls">
                            <input
                                type="text"
                                placeholder="Search by course name or code..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <select
                                className="hall-select"
                                value={selectedHall}
                                onChange={(e) => { setSelectedHall(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">All Lecture Halls</option>
                                {allUniqueHalls.map(hall => <option key={hall} value={hall}>{hall}</option>)}
                            </select>
                            {/* REMOVED: The "Day" select dropdown is gone */}
                        </div>

                        {filteredAssignments.length > 0 ? (
                            <>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Course (Code) & Type</th>
                                            <th>Lecture Hall(s)</th>
                                            <th>Schedule</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAssignments.map((item, index) => (
                                            <tr key={`${item['Course Code']}-${index}`}>
                                                <td>{`${item['Course Name']} (${item['Course Code']})`} <strong>({item.Type})</strong></td>
                                                <td>{item['Lecture Hall Allocated']}</td>
                                                <td>{item.Schedule}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="pagination-controls">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&larr; Previous</button>
                                    <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Next &rarr;</button>
                                </div>
                            </>
                        ) : <p>No assignments match your search criteria.</p>}
                    </div>
                )}

                {viewMode === 'room' && (
                    <div id="room-view">
                        <div className="room-search-container">
                            <input
                                type="text"
                                placeholder="Search by room name..."
                                className="search-input"
                                value={roomSearchTerm}
                                onChange={(e) => setRoomSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="room-view-container">
                            {filteredHalls.map(hallName => {
                                const hallAllocations = allocationsByRoom[hallName] || [];
                                return (
                                    <div key={hallName} className="room-card">
                                        <h4>{hallName}</h4>
                                        {hallAllocations.length > 0 ? (
                                            <table className="room-schedule-table">
                                                <thead>
                                                    <tr>
                                                        <th>Schedule</th>
                                                        <th>Course (Code) & Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {hallAllocations.map((item, index) => ( // REMOVED: .sort() method
                                                        <tr key={`${item['Course Code']}-${index}`}>
                                                            <td>{item.Schedule}</td>
                                                            <td>{`${item['Course Name']} (${item['Course Code']})`} <strong>({item.Type})</strong></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="empty-room-message">No courses allocated to this room.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Link to="/" className="back-button">
                Generate Another Schedule
            </Link>
        </div>
    );
};

export default ResultsPage;