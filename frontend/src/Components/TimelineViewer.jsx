import React, { useState, useMemo } from 'react';
import '../Styles/TimelineViewer.css';

// --- MOCK DATA with variable start/end times and durations ---
const generatedSchedule = {
    monday: [
        { course: 'CS101', hall: 'L01', start: '09:00', end: '10:30' },
        { course: 'MA210', hall: 'L01', start: '14:00', end: '15:30' },
        { course: 'PHY101', hall: 'L02', start: '10:00', end: '11:50' },
        { course: 'CHM101', hall: 'L03', start: '08:30', end: '10:00' },
        { course: 'EE101', hall: 'L03', start: '13:00', end: '14:20' },
    ],
    tuesday: [
        { course: 'CS202', hall: 'L02', start: '09:30', end: '11:00' },
        { course: 'HU101', hall: 'L03', start: '11:00', end: '12:00' },
        { course: 'MA211', hall: 'L01', start: '15:00', end: '16:30' },
    ],
    wednesday: [
        { course: 'CS101', hall: 'L01', start: '10:00', end: '11:30' },
        { course: 'PHY101', hall: 'L02', start: '14:30', end: '16:00' },
        { course: 'ME301', hall: 'L04', start: '11:00', end: '12:50' },
    ],
    thursday: [
        { course: 'CS202', hall: 'L02', start: '09:00', end: '10:20' },
        { course: 'EE201', hall: 'L01', start: '11:10', end: '12:30' },
        { course: 'CHM101', hall: 'L03', start: '16:00', end: '17:00' },
    ],
    friday: [
        { course: 'CS301', hall: 'L01', start: '09:00', end: '10:50' },
        { course: 'HU101', hall: 'L03', start: '13:30', end: '15:00' },
        { course: 'ME405', hall: 'L04', start: '14:00', end: '15:50' },
    ],
};

// --- Helper function to convert time string (HH:MM) to minutes from midnight ---
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const TimelineViewer = () => {
    const [currentDay, setCurrentDay] = useState('monday');
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    const timelineStart = timeToMinutes('08:00'); // 8 AM
    const timelineEnd = timeToMinutes('19:00'); // 7 PM
    const totalDuration = timelineEnd - timelineStart;

    const lectureHalls = useMemo(() => {
        const allHalls = new Set();
        Object.values(generatedSchedule).forEach(daySchedule => {
            daySchedule.forEach(item => allHalls.add(item.hall));
        });
        if (allHalls.size === 0) return ['L01', 'L02', 'L03', 'L04'];
        return Array.from(allHalls).sort();
    }, []);

    const scheduleForDay = generatedSchedule[currentDay] || [];

    return (
        <div className="timeline-viewer-container">
            <header className="main-header">
                <h1>Schedule Timeline Viewer</h1>
                <p>A dynamic timeline view of the generated course schedule.</p>
            </header>

            <div className="timeline-card">
                <div className="day-selector">
                    {daysOfWeek.map(day => (
                        <button
                            key={day}
                            className={`day-btn ${currentDay === day ? 'active' : ''}`}
                            onClick={() => setCurrentDay(day)}
                        >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="timeline-wrapper">
                    {/* Hour Markers */}
                    <div className="hour-markers">
                        {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                            <div key={hour} className="hour-marker">
                                {String(hour).padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Timeline Columns */}
                    <div className="timeline-grid">
                        {lectureHalls.map(hall => (
                            <div key={hall} className="hall-column">
                                <div className="hall-header">{hall}</div>
                                <div className="hall-timeline">
                                    {scheduleForDay
                                        .filter(item => item.hall === hall)
                                        .map((item, index) => {
                                            const startMinutes = timeToMinutes(item.start);
                                            const endMinutes = timeToMinutes(item.end);
                                            
                                            const top = ((startMinutes - timelineStart) / totalDuration) * 100;
                                            const height = ((endMinutes - startMinutes) / totalDuration) * 100;

                                            return (
                                                <div
                                                    key={index}
                                                    className="lecture-block"
                                                    style={{ top: `${top}%`, height: `${height}%` }}
                                                >
                                                    <div className="block-course">{item.course}</div>
                                                    <div className="block-time">{item.start} - {item.end}</div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineViewer;
