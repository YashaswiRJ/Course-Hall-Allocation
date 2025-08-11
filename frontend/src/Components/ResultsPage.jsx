import React, { useState, useMemo } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import '../Styles/ResultsPage.css';

const ResultsPage = () => {
    const location = useLocation();
    const schedule = location.state?.schedule;

    // --- All React Hooks are at the top ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHall, setSelectedHall] = useState('all');
    // --- NEW: State for the day filter ---
    const [selectedDay, setSelectedDay] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const assignmentsPerPage = 20;

    // Memoized filtering logic
    const filteredAssignments = useMemo(() => {
        const assignments = schedule?.generated_assignments || [];
        return assignments.filter(item => {
            const courseMatch = item.course_name.toLowerCase().includes(searchTerm.toLowerCase());
            const hallMatch = selectedHall === 'all' || item.hall_name === selectedHall;
            // --- NEW: Add day matching to the filter logic ---
            const dayMatch = selectedDay === 'all' || item.day.toLowerCase() === selectedDay.toLowerCase();
            return courseMatch && hallMatch && dayMatch;
        });
    }, [schedule, searchTerm, selectedHall, selectedDay]); // Added 'selectedDay' to dependency array

    // Get unique hall names for the filter dropdown
    const uniqueHalls = useMemo(() => {
        const assignments = schedule?.generated_assignments || [];
        return [...new Set(assignments.map(item => item.hall_name))].sort()
    }, [schedule]);

    if (!schedule) {
        return <Navigate to="/" replace />;
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const indexOfLastItem = currentPage * assignmentsPerPage;
    const indexOfFirstItem = indexOfLastItem - assignmentsPerPage;
    const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const {
        message,
        total_courses_processed,
        successful_assignments,
    } = schedule;

    return (
        <div className="results-page-container">
            {/* The header and summary card remain the same */}
            <header className="main-header">
                <h1>Schedule Generated Successfully!</h1>
                <p>{message}</p>
            </header>

            <div className="summary-card">
                <h3>Summary</h3>
                <div className="summary-stats">
                    <div className="stat-item">
                        <span className="stat-value">{total_courses_processed}</span>
                        <span className="stat-label">Courses Processed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{successful_assignments}</span>
                        <span className="stat-label">Successful Assignments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{total_courses_processed - successful_assignments}</span>
                        <span className="stat-label">Unassigned Courses</span>
                    </div>
                </div>
            </div>

            <div className="assignments-card">
                <div className="card-header">
                  <h3>Detailed Assignments</h3>
                  <div className="filter-controls">
                      <input
                          type="text"
                          placeholder="Search by course name..."
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
                          {uniqueHalls.map(hall => <option key={hall} value={hall}>{hall}</option>)}
                      </select>
                      
                      {/* --- NEW: Day Filter Dropdown --- */}
                      <select
                          className="day-select"
                          value={selectedDay}
                          onChange={(e) => { setSelectedDay(e.target.value); setCurrentPage(1); }}
                      >
                          <option value="all">All Days</option>
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                      </select>
                  </div>
                </div>

                {/* The rest of the JSX remains the same */}
                {filteredAssignments.length > 0 ? (
                    <>
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Course Name (ID)</th>
                                    <th>Lecture Hall</th>
                                    <th>Day</th>
                                    <th>Time Slot</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAssignments.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.course_name} ({item.course_id})</td>
                                        <td>{item.hall_name}</td>
                                        <td>{item.day}</td>
                                        <td>{`${item.start_time} - ${item.end_time}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                &larr; Previous
                            </button>
                            <span>
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                                Next &rarr;
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No assignments match your search criteria.</p>
                )}
            </div>

            <Link to="/" className="back-button">
                Generate Another Schedule
            </Link>
        </div>
    );
};

export default ResultsPage;