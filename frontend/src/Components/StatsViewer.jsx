import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/StatsViewer.css';

// --- Helper function to convert time string (HH:MM) to minutes from midnight ---
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// --- Constants for the schedule's time window ---
const SCHEDULE_START_HOUR = 8;
const SCHEDULE_END_HOUR = 19; // Ends at 19:00 (7 PM)

// This map now correctly handles 'Th' for Thursday and multi-character day strings
const DAY_MAP = {
    M: 'monday',
    T: 'tuesday',
    W: 'wednesday',
    Th: 'thursday',
    R: 'thursday', // Keep for robustness
    F: 'friday',
    S: 'saturday'
};

const StatsViewer = () => {
    const [allocations, setAllocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const savedAllocations = localStorage.getItem('latestAllocationResult');
            if (savedAllocations) {
                const parsedData = JSON.parse(savedAllocations);
                setAllocations(Array.isArray(parsedData) ? parsedData : parsedData.StatsData || []);
            }
        } catch (error) {
            console.error("Failed to parse schedule data from localStorage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processedSchedule = useMemo(() => {
        const events = [];
        if (!allocations) return [];

        allocations.forEach(item => {
            const scheduleString = item['Schedule']?.trim();
            const hallsString = item['Lecture Hall Allocated']?.trim();
            const courseCode = item['Course Code'] || 'N/A';

            if (!scheduleString || !hallsString) return;

            const lastSpaceIndex = scheduleString.lastIndexOf(' ');
            if (lastSpaceIndex === -1) return;

            const daysPart = scheduleString.substring(0, lastSpaceIndex);
            const timePart = scheduleString.substring(lastSpaceIndex + 1);
            
            const [start, end] = timePart.split('-');
            if (!start || !end) return;

            const halls = hallsString.split(',').map(h => h.trim());
            
            const days = [];
            let i = 0;
            while (i < daysPart.length) {
                if (daysPart[i] === 'T' && daysPart[i+1] === 'h') {
                    days.push('Th');
                    i += 2;
                } else {
                    days.push(daysPart[i]);
                    i += 1;
                }
            }

            halls.forEach(hall => {
                days.forEach(dayCode => {
                    const dayName = DAY_MAP[dayCode];
                    if (dayName) {
                        events.push({
                            id: `${courseCode}-${hall}-${dayCode}-${start}`, // Added start time for more unique ID
                            course: courseCode,
                            hall: hall,
                            day: dayName,
                            start: start,
                            end: end,
                        });
                    }
                });
            });
        });
        
        return events;
    }, [allocations]);

    const { daysOfWeek, lectureHalls } = useMemo(() => {
        const daySet = new Set();
        const hallSet = new Set();
        processedSchedule.forEach(event => {
            daySet.add(event.day);
            hallSet.add(event.hall);
        });
        
        const sortedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].filter(d => daySet.has(d));
        const sortedHalls = Array.from(hallSet).sort();

        return { daysOfWeek: sortedDays, lectureHalls: sortedHalls };
    }, [processedSchedule]);
    
    const [currentDay, setCurrentDay] = useState('');

    useEffect(() => {
        if(daysOfWeek.length > 0 && !daysOfWeek.includes(currentDay)) {
            setCurrentDay(daysOfWeek[0]);
        }
    }, [daysOfWeek, currentDay]);

    // --- NEW: Generate hour markers for the header and background grid ---
    const hourMarkers = useMemo(() => {
        const hours = [];
        for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
            hours.push(`${String(h).padStart(2, '0')}:00`);
        }
        return hours;
    }, []);

    const dailyScheduleMap = useMemo(() => {
        const map = new Map();
        const daySchedule = processedSchedule.filter(event => event.day === currentDay);
        
        for (const item of daySchedule) {
            if (!map.has(item.hall)) {
                map.set(item.hall, []);
            }
            map.get(item.hall).push(item);
        }
        return map;
    }, [currentDay, processedSchedule]);

    if (isLoading) {
        return <div className="loading-container">Loading Schedule...</div>;
    }
    
    if (allocations.length === 0 || lectureHalls.length === 0) {
        return (
            <div className="stats-viewer-container">
                 <div className="schedule-card empty-state">
                    <h3>No Schedule Data Found</h3>
                    <p>Could not find any allocation results in storage. Please generate a schedule first.</p>
                    <Link to="/" className="back-to-home-btn">Generate Schedule</Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="stats-viewer-container">
            <header className="main-header">
                <h1>Master Schedule Viewer</h1>
                <p>A comprehensive grid view of all allocated courses and their assigned lecture halls.</p>
            </header>

            <div className="schedule-card">
                <div className="day-selector">
                    {daysOfWeek.map(day => (
                        <button key={day} className={`day-btn ${currentDay === day ? 'active' : ''}`} onClick={() => setCurrentDay(day)}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                    ))}
                </div>

                {/* --- REWRITTEN GRID LOGIC --- */}
                <div className="timetable-grid-container">
                    <div className="timetable-grid">
                        {/* --- Header Row --- */}
                        <div className="grid-header sticky-col">Hall</div>
                        <div className="time-header-track">
                            {hourMarkers.map(hour => (
                                <div key={hour} className="time-label">{hour}</div>
                            ))}
                        </div>

                        {/* --- Body Rows (one for each hall) --- */}
                        {lectureHalls.map(hall => {
                            const hallSchedule = dailyScheduleMap.get(hall) || [];
                            return (
                                <React.Fragment key={hall}>
                                    <div className="hall-label sticky-col">{hall}</div>
                                    <div className="schedule-track">
                                        {/* Background vertical lines for each hour */}
                                        {hourMarkers.map((_, index) => (
                                            <div key={`line-${index}`} className="hour-marker-line"></div>
                                        ))}

                                        {/* Placed Events */}
                                        {hallSchedule.map(event => {
                                            const totalScheduleMinutes = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 60;
                                            const startOffsetMinutes = timeToMinutes(event.start) - (SCHEDULE_START_HOUR * 60);
                                            const durationMinutes = timeToMinutes(event.end) - timeToMinutes(event.start);
                                            
                                            // Skip rendering if event is outside the defined schedule hours
                                            if (startOffsetMinutes < 0 || startOffsetMinutes > totalScheduleMinutes) {
                                                return null;
                                            }
                                            
                                            const left = (startOffsetMinutes / totalScheduleMinutes) * 100;
                                            const width = (durationMinutes / totalScheduleMinutes) * 100;

                                            const eventStyle = {
                                                left: `${left}%`,
                                                width: `${width}%`,
                                            };

                                            return (
                                                <div key={event.id} className="allocated-event" style={eventStyle} title={`${event.course} (${event.start} - ${event.end})`}>
                                                   <span className="course-code">{event.course}</span>
                                                   <span className="course-time">{event.start} - {event.end}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsViewer;