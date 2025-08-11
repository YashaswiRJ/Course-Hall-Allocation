import React, { useState, useMemo } from 'react';
import '../Styles/StatsViewer.css';

// --- MOCK DATA with variable start/end times ---
const generatedSchedule = {
    monday: [
        { course: 'CS101', hall: 'L01', start: '09:00', end: '10:30' },
        { course: 'MA210', hall: 'L01', start: '14:00', end: '15:30' },
        { course: 'PHY101', hall: 'L02', start: '10:00', end: '11:50' },
        { course: 'CHM101', hall: 'L03', start: '08:30', end: '10:00' },
    ],
    tuesday: [
        { course: 'CS202', hall: 'L02', start: '09:30', end: '11:00' },
        { course: 'HU101', hall: 'L03', start: '11:00', end: '12:00' },
        { course: 'MA211', hall: 'L01', start: '15:00', end: '16:30' },
    ],
    friday: [
        { course: 'CS301', hall: 'L01', start: '09:00', end: '10:50' },
        { course: 'HU101', hall: 'L03', start: '13:30', end: '15:00' },
    ],
};

// --- Helper function to convert time string (HH:MM) to minutes from midnight ---
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const SLOT_DURATION = 10; // Use 10-minute slots for high granularity

const StatsViewer = () => {
    const [currentDay, setCurrentDay] = useState('friday'); // Default to friday to show 10:50 case
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = 8; h < 19; h++) {
            for (let m = 0; m < 60; m += SLOT_DURATION) {
                slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
        }
        return slots;
    }, []);

    const lectureHalls = useMemo(() => {
        const allHalls = new Set();
        Object.values(generatedSchedule).forEach(daySchedule => {
            daySchedule.forEach(item => allHalls.add(item.hall));
        });
        if (allHalls.size === 0) return ['L01', 'L02', 'L03', 'L04'];
        return Array.from(allHalls).sort();
    }, []);
    
    const scheduleMap = useMemo(() => {
        const map = new Map();
        const daySchedule = generatedSchedule[currentDay] || [];
        for(const item of daySchedule) {
            if(!map.has(item.hall)) {
                map.set(item.hall, []);
            }
            map.get(item.hall).push(item);
        }
        return map;
    }, [currentDay]);


    return (
        <div className="stats-viewer-container">
            <header className="main-header">
                <h1>Master Schedule Viewer</h1>
                <p>View the generated course schedule with variable durations.</p>
            </header>

            <div className="schedule-card">
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

                <div className="timetable-grid-container">
                    <div className="timetable-grid" style={{ gridTemplateColumns: `100px repeat(${timeSlots.length}, 1fr)` }}>
                        {/* Header Row */}
                        <div className="grid-header">Hall</div>
                        {timeSlots.map(time => (
                            <div key={time} className={`grid-header time-header ${time.endsWith('50') ? 'hour-end' : ''}`}>
                                {time.endsWith(':00') ? time : ''}
                            </div>
                        ))}

                        {/* Data Rows */}
                        {lectureHalls.map(hall => {
                            const hallSchedule = scheduleMap.get(hall) || [];
                            const occupiedSlots = new Set();

                            // Pre-calculate occupied slots to avoid rendering empty cells under a spanned event
                            hallSchedule.forEach(item => {
                                const startMinutes = timeToMinutes(item.start);
                                const endMinutes = timeToMinutes(item.end);
                                const duration = endMinutes - startMinutes;
                                const colspan = Math.ceil(duration / SLOT_DURATION);

                                const startIndex = timeSlots.findIndex(slot => timeToMinutes(slot) >= startMinutes);

                                if (startIndex !== -1) {
                                    for (let i = 1; i < colspan; i++) {
                                        const nextSlotIndex = startIndex + i;
                                        if (nextSlotIndex < timeSlots.length) {
                                            occupiedSlots.add(timeSlots[nextSlotIndex]);
                                        }
                                    }
                                }
                            });

                            return (
                                <React.Fragment key={hall}>
                                    <div className="hall-label">{hall}</div>
                                    {timeSlots.map((time, timeIndex) => {
                                        if (occupiedSlots.has(time)) {
                                            return null; 
                                        }

                                        const event = hallSchedule.find(item => {
                                            const startMinutes = timeToMinutes(item.start);
                                            const slotMinutes = timeToMinutes(time);
                                            return slotMinutes >= startMinutes && slotMinutes < startMinutes + SLOT_DURATION;
                                        });

                                        if (event) {
                                            const startMinutes = timeToMinutes(event.start);
                                            const endMinutes = timeToMinutes(event.end);
                                            const duration = endMinutes - startMinutes;
                                            const colspan = Math.ceil(duration / SLOT_DURATION);
                                            
                                            return (
                                                <div key={`${hall}-${time}`} className="grid-cell allocated" style={{ gridColumn: `span ${colspan}` }}>
                                                   <span className="course-code">{event.course}</span>
                                                   <span className="course-time">{event.start} - {event.end}</span>
                                                </div>
                                            );
                                        }

                                        // Add class to cells that are at the end of an hour
                                        const cellClass = time.endsWith('50') ? 'grid-cell hour-end' : 'grid-cell';
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
