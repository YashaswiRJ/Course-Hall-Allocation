import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/StatsViewer.css';

// --- Helper function to convert time string (HH:MM) to minutes from midnight ---
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// --- Constants ---
const SLOT_DURATION_MINUTES = 10;
const SCHEDULE_START_HOUR = 8;
const SCHEDULE_END_HOUR = 19;

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
                // The data might be inside a parent key like 'StatsData'
                const parsedData = JSON.parse(savedAllocations);
                setAllocations(Array.isArray(parsedData) ? parsedData : parsedData.StatsData || []);
            }
        } catch (error) {
            console.error("Failed to parse schedule data from localStorage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- MAJOR REWRITE: This entire block is new to parse your specific data format ---
    const processedSchedule = useMemo(() => {
        const events = [];
        if (!allocations) return [];

        allocations.forEach(item => {
            const scheduleString = item['Schedule']?.trim();
            const hallsString = item['Lecture Hall Allocated']?.trim();
            const courseCode = item['Course Code'] || 'N/A';

            // Skip if essential information is missing
            if (!scheduleString || !hallsString) {
                return;
            }

            // 1. Handle multiple, comma-separated halls
            const halls = hallsString.split(',').map(h => h.trim());

            // 2. Parse the schedule string (e.g., "MWF 09:00-10:00")
            const lastSpaceIndex = scheduleString.lastIndexOf(' ');
            if (lastSpaceIndex === -1) return; // Invalid format

            const daysPart = scheduleString.substring(0, lastSpaceIndex);
            const timePart = scheduleString.substring(lastSpaceIndex + 1);
            
            const [start, end] = timePart.split('-');
            if (!start || !end) return; // Invalid time format

            // 3. Parse the days part (handles "MWF" and "Th")
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

            // 4. Create an event for each day in each hall
            halls.forEach(hall => {
                days.forEach(dayCode => {
                    const dayName = DAY_MAP[dayCode];
                    if (dayName) {
                        events.push({
                            id: `${courseCode}-${hall}-${dayCode}`,
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

    // --- NO CHANGES NEEDED BELOW THIS LINE ---
    // The rest of the component works perfectly once the data above is processed correctly.

    const { daysOfWeek, lectureHalls } = useMemo(() => {
        const daySet = new Set();
        const hallSet = new Set();
        processedSchedule.forEach(event => {
            daySet.add(event.day);
            hallSet.add(event.hall);
        });
        
        const sortedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].filter(d => daySet.has(d));
        // Dynamically create the list of halls from the data provided
        const sortedHalls = Array.from(hallSet).sort();

        return { daysOfWeek: sortedDays, lectureHalls: sortedHalls };
    }, [processedSchedule]);
    
    // ... (The rest of the component is identical to the last version)
    const [currentDay, setCurrentDay] = useState(daysOfWeek[0] || 'monday');

    useEffect(() => {
        if(daysOfWeek.length > 0 && !daysOfWeek.includes(currentDay)) {
            setCurrentDay(daysOfWeek[0]);
        }
    }, [daysOfWeek, currentDay]);

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
            for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
                slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
        }
        return slots;
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

                <div className="timetable-grid-container">
                    <div className="timetable-grid" style={{ gridTemplateColumns: `120px repeat(${timeSlots.length}, 1fr)` }}>
                        <div className="grid-header sticky-col">Hall</div>
                        {timeSlots.map(time => (
                            <div key={time} className={`grid-header time-header ${time.endsWith(':00') ? 'full-hour-label' : ''} ${time.endsWith('50') ? 'hour-end-marker' : ''}`}>
                                {time.endsWith(':00') ? time : ''}
                            </div>
                        ))}

                        {lectureHalls.map(hall => {
                            const hallSchedule = dailyScheduleMap.get(hall) || [];
                            const occupiedSlots = new Set();
                            hallSchedule.forEach(item => {
                                const startMinutes = timeToMinutes(item.start);
                                const endMinutes = timeToMinutes(item.end);
                                const duration = endMinutes - startMinutes;
                                const colspan = Math.round(duration / SLOT_DURATION_MINUTES);
                                const startIndex = timeSlots.findIndex(slot => timeToMinutes(slot) >= startMinutes);
                                if (startIndex !== -1) {
                                    for (let i = 1; i < colspan; i++) {
                                        occupiedSlots.add(timeSlots[startIndex + i]);
                                    }
                                }
                            });
                            return (
                                <React.Fragment key={hall}>
                                    <div className="hall-label sticky-col">{hall}</div>
                                    {timeSlots.map(time => {
                                        if (occupiedSlots.has(time)) return null;
                                        const event = hallSchedule.find(item => {
                                            const startMinutes = timeToMinutes(item.start);
                                            const slotMinutes = timeToMinutes(time);
                                            return slotMinutes >= startMinutes && slotMinutes < startMinutes + SLOT_DURATION_MINUTES;
                                        });
                                        if (event) {
                                            const startMinutes = timeToMinutes(event.start);
                                            const endMinutes = timeToMinutes(event.end);
                                            const duration = endMinutes - startMinutes;
                                            const colspan = Math.max(1, Math.round(duration / SLOT_DURATION_MINUTES));
                                            return (
                                                <div key={`${hall}-${time}`} className="grid-cell allocated" style={{ gridColumn: `span ${colspan}` }}>
                                                   <span className="course-code">{event.course}</span>
                                                   <span className="course-time">{event.start} - {event.end}</span>
                                                </div>
                                            );
                                        }
                                        const cellClass = time.endsWith('50') ? 'grid-cell hour-end-marker' : 'grid-cell';
                                        return <div key={`${hall}-${time}`} className={cellClass}></div>;
                                    })}
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