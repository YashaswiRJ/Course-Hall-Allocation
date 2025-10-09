import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import "../Styles/ResultsPage.css"

const ResultsPage = () => {
    const location = useLocation();

    // --- State for data loading and schedule ---
    const [scheduleData, setScheduleData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let data = null;
        // Case 1: New results are passed via navigation state after generation
        if (location.state?.schedule) {
            data = location.state.schedule;
            // Persist this new result to localStorage
            localStorage.setItem('latestAllocationResult', JSON.stringify(data['Allocation Result'] || []));
            localStorage.setItem('latestUnallocatedCourses', JSON.stringify(data['Unallocated Course'] || []));
        } 
        // Case 2: User is navigating directly, so load from localStorage
        else {
            const savedAllocations = localStorage.getItem('latestAllocationResult');
            const savedUnallocated = localStorage.getItem('latestUnallocatedCourses');
            if (savedAllocations || savedUnallocated) {
                data = {
                    'Allocation Result': savedAllocations ? JSON.parse(savedAllocations) : [],
                    'Unallocated Course': savedUnallocated ? JSON.parse(savedUnallocated) : [],
                };
            }
        }
        
        setScheduleData(data);
        setIsLoading(false);
    }, [location.state?.schedule]);


    // --- UI State Hooks ---
    const [viewMode, setViewMode] = useState('room');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHall, setSelectedHall] = useState('all');
    const [roomSearchTerm, setRoomSearchTerm] = useState('');
    const [unallocatedSearchTerm, setUnallocatedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [unallocatedCurrentPage, setUnallocatedCurrentPage] = useState(1);
    const assignmentsPerPage = 20;
    const unallocatedPerPage = 10;

    // --- Data Memoization ---
    const assignments = useMemo(() => scheduleData?.['Allocation Result'] || [], [scheduleData]);
    const unallocatedCourses = useMemo(() => scheduleData?.['Unallocated Course'] || [], [scheduleData]);
    console.log('assignments: ', assignments);
    // Get master list of all halls
    const allUniqueHalls = useMemo(() => {
        const hallSet = new Set(assignments.flatMap(item => item['Lecture Hall Allocated']?.split(',').map(h => h.trim()) || []));
        return Array.from(hallSet).sort();
    }, [assignments]);
    
    // Data grouping for Room View
    const allocationsByRoom = useMemo(() => {
        const acc = {};
        assignments.forEach(item => {
            const hallNames = item['Lecture Hall Allocated']?.split(',') || [];
            hallNames.forEach(hallName => {
                const trimmedName = hallName.trim();
                if (!acc[trimmedName]) acc[trimmedName] = [];
                acc[trimmedName].push(item);
            });
        });
        return acc;
    }, [assignments]);

    // Filtering for "Course View"
    const filteredAssignments = useMemo(() => {
        return assignments.filter(item => {
            const normalizedSearch = searchTerm.toLowerCase();
            const courseMatch = (item['Course Name']?.toLowerCase().includes(normalizedSearch) || item['Course Code']?.toLowerCase().includes(normalizedSearch));
            const hallMatch = selectedHall === 'all' || item['Lecture Hall Allocated']?.split(',').map(h => h.trim()).includes(selectedHall);
            return courseMatch && hallMatch;
        });
    }, [assignments, searchTerm, selectedHall]);

    // Filtering for "Unallocated View"
    const filteredUnallocated = useMemo(() => {
        return unallocatedCourses.filter(item => {
            const normalizedSearch = unallocatedSearchTerm.toLowerCase();
            return item['Course Name']?.toLowerCase().includes(normalizedSearch) || item['Course Code']?.toLowerCase().includes(normalizedSearch);
        });
    }, [unallocatedCourses, unallocatedSearchTerm]);
    
    // --- Pagination Calculations ---
    const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const currentAssignments = filteredAssignments.slice((currentPage - 1) * assignmentsPerPage, currentPage * assignmentsPerPage);
    
    const totalUnallocatedPages = Math.ceil(filteredUnallocated.length / unallocatedPerPage);
    const currentUnallocated = filteredUnallocated.slice((unallocatedCurrentPage - 1) * unallocatedPerPage, unallocatedCurrentPage * unallocatedPerPage);

    const filteredHalls = allUniqueHalls.filter(hall => hall.toLowerCase().includes(roomSearchTerm.toLowerCase()));

    // --- CSV Download Handler ---
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert("No data to download.");
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>Loading results...</div>; 
    }

    if (!scheduleData) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="results-page-container">
            <header className="main-header">
                <h1>Schedule Generated!</h1>
                <p>Review the detailed course allocations and unallocated courses below.</p>
            </header>

            <div className="summary-card">
                <h3>Summary</h3>
                <div className="summary-stats">
                    <div className="stat-item">
                        <span className="stat-value">{assignments.length + unallocatedCourses.length}</span>
                        <span className="stat-label">Courses Processed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value success">{assignments.length}</span>
                        <span className="stat-label">Successful Assignments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value warning">{unallocatedCourses.length}</span>
                        <span className="stat-label">Unassigned Courses</span>
                    </div>
                </div>
            </div>

            <div className="assignments-card">
                <div className="card-header">
                    <h3>Detailed Assignments</h3>
                    <div className="view-toggle">
                        <button className={viewMode === 'course' ? 'active' : ''} onClick={() => setViewMode('course')}>Course View</button>
                        <button className={viewMode === 'room' ? 'active' : ''} onClick={() => setViewMode('room')}>Room View</button>
                        <button className={viewMode === 'unallocated' ? 'active' : ''} onClick={() => setViewMode('unallocated')}>Unallocated View</button>
                    </div>
                </div>

                {viewMode === 'course' && (
                    <div id="course-view">
                        <div className="filter-controls">
                            <input type="text" placeholder="Search by course name or code..." className="search-input" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            <select className="hall-select" value={selectedHall} onChange={(e) => { setSelectedHall(e.target.value); setCurrentPage(1); }}>
                                <option value="all">All Lecture Halls</option>
                                {allUniqueHalls.map(hall => <option key={hall} value={hall}>{hall}</option>)}
                            </select>
                        </div>
                        {currentAssignments.length > 0 ? (
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
                        ) : <p className="empty-message">No assignments match your search criteria.</p>}
                    </div>
                )}

                {viewMode === 'room' && (
                    <div id="room-view">
                        <div className="room-search-container"><input type="text" placeholder="Search by room name..." className="search-input" value={roomSearchTerm} onChange={(e) => setRoomSearchTerm(e.target.value)} /></div>
                        <div className="room-view-container">
                            {filteredHalls.length > 0 ? filteredHalls.map(hallName => (
                                <div key={hallName} className="room-card">
                                    <h4>{hallName}</h4>
                                    {(allocationsByRoom[hallName] || []).length > 0 ? (
                                        <table className="room-schedule-table">
                                            <thead><tr><th>Schedule</th><th>Course (Code) & Type</th></tr></thead>
                                            <tbody>{allocationsByRoom[hallName].map((item, index) => (<tr key={`${item['Course Code']}-${index}`}><td>{item.Schedule}</td><td>{`${item['Course Name']} (${item['Course Code']})`} <strong>({item.Type})</strong></td></tr>))}</tbody>
                                        </table>
                                    ) : <p className="empty-room-message">No courses allocated.</p>}
                                </div>
                            )) : <p className="empty-message">No rooms match your search.</p>}
                        </div>
                    </div>
                )}

                {viewMode === 'unallocated' && (
                    <div id="unallocated-view">
                        <div className="filter-controls">
                            <input type="text" placeholder="Search by course name or code..." className="search-input" value={unallocatedSearchTerm} onChange={(e) => { setUnallocatedSearchTerm(e.target.value); setUnallocatedCurrentPage(1);}}/>
                            <button className="download-btn" onClick={() => downloadCSV(filteredUnallocated, 'unallocated_courses')}>Download CSV</button>
                        </div>
                        {currentUnallocated.length > 0 ? (
                             <>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Course Name</th>
                                            <th>Course Code</th>
                                            <th>Type</th>
                                            <th>Section</th>
                                            <th>Schedule</th>
                                            <th>Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUnallocated.map((item, index) => (
                                            <tr key={`${item['Course Code']}-${index}`}>
                                                <td>{item['Course Name']}</td>
                                                <td>{item['Course Code']}</td>
                                                <td>{item['Type']}</td>
                                                <td>{item['Section']}</td>
                                                <td>{item['Schedule']}</td>
                                                <td>{item['Students Registered']}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="pagination-controls">
                                     <button onClick={() => setUnallocatedCurrentPage(p => Math.max(p - 1, 1))} disabled={unallocatedCurrentPage === 1}>&larr; Previous</button>
                                     <span>Page <strong>{unallocatedCurrentPage}</strong> of <strong>{totalUnallocatedPages}</strong></span>
                                     <button onClick={() => setUnallocatedCurrentPage(p => Math.min(p + 1, totalUnallocatedPages))} disabled={unallocatedCurrentPage === totalUnallocatedPages || totalUnallocatedPages === 0}>Next &rarr;</button>
                                </div>
                            </>
                        ) : <p className="empty-message">No unallocated courses found.</p>}
                    </div>
                )}
            </div>
            <Link to="/" className="back-button">Generate Another Schedule</Link>
        </div>
    );
};

export default ResultsPage;

