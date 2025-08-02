import React, { useState, useMemo, useEffect } from 'react';
import '../Styles/LectureHallManager.css';

// The key we will use to save and retrieve hall data in localStorage
const LECTURE_HALL_STORAGE_KEY = 'lectureHallManagerData';

// Helper to generate initial dummy data
const generateInitialHalls = () => {
  const halls = [];
  for (let i = 1; i <= 20; i++) {
    halls.push({
      id: i,
      name: `L${String(i).padStart(2, '0')}`,
      capacity: Math.floor(Math.random() * (600 - 200 + 1)) + 200,
      schedule: {
        monday: [{ open: '08:00', close: '12:00' }, { open: '13:00', close: '17:00' }],
        tuesday: [{ open: '09:00', close: '17:00' }],
        wednesday: [{ open: '08:00', close: '17:00' }],
        thursday: [{ open: '09:00', close: '13:00' }, { open: '14:00', close: '18:00' }],
        friday: [{ open: '08:00', close: '17:00' }],
      },
    });
  }
  return halls;
};

// Main Component
const LectureHallManager = () => {
  // Load initial state from localStorage, or generate if it doesn't exist
  const [halls, setHalls] = useState(() => {
    try {
        const savedHalls = localStorage.getItem(LECTURE_HALL_STORAGE_KEY);
        // If data exists, parse it. Otherwise, generate initial data.
        return savedHalls ? JSON.parse(savedHalls) : generateInitialHalls();
    } catch (error) {
        console.error("Error reading lecture halls from localStorage", error);
        return generateInitialHalls();
    }
  });

  // useEffect to update localStorage whenever the halls state changes
  useEffect(() => {
    try {
        localStorage.setItem(LECTURE_HALL_STORAGE_KEY, JSON.stringify(halls));
    } catch (error) {
        console.error("Error saving lecture halls to localStorage", error);
    }
  }, [halls]); // This effect runs every time the 'halls' state is updated

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHall, setCurrentHall] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hallsPerPage, setHallsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHalls = useMemo(() => {
    return halls.filter(hall =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * hallsPerPage;
    const lastPageIndex = firstPageIndex + hallsPerPage;
    return filteredHalls.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, hallsPerPage, filteredHalls]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hallsPerPage]);

  const handleEdit = (hall) => {
    setCurrentHall(JSON.parse(JSON.stringify(hall)));
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentHall({
      id: null, name: '', capacity: 300,
      schedule: {
        monday: [{ open: '08:00', close: '17:00' }],
        tuesday: [{ open: '08:00', close: '17:00' }],
        wednesday: [{ open: '08:00', close: '17:00' }],
        thursday: [{ open: '08:00', close: '17:00' }],
        friday: [{ open: '08:00', close: '17:00' }],
      },
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentHall(null);
  };

  const handleSave = () => {
    if (currentHall.id) {
      setHalls(halls.map((hall) => (hall.id === currentHall.id ? currentHall : hall)));
    } else {
      const newHall = { ...currentHall, id: halls.length > 0 ? Math.max(...halls.map(h => h.id)) + 1 : 1 };
      setHalls([...halls, newHall]);
    }
    handleCloseModal();
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentHall({ ...currentHall, [name]: value });
  };

  const handleTimeChange = (day, index, type, value) => {
    const newSchedule = { ...currentHall.schedule };
    newSchedule[day][index][type] = value;
    setCurrentHall({ ...currentHall, schedule: newSchedule });
  };

  const addSlot = (day) => {
    const newSchedule = { ...currentHall.schedule };
    newSchedule[day].push({ open: '08:00', close: '17:00' });
    setCurrentHall({ ...currentHall, schedule: newSchedule });
  };

  const removeSlot = (day, index) => {
    const newSchedule = { ...currentHall.schedule };
    if (newSchedule[day].length > 1) {
      newSchedule[day].splice(index, 1);
      setCurrentHall({ ...currentHall, schedule: newSchedule });
    }
  };

  const totalPages = Math.ceil(filteredHalls.length / hallsPerPage);

  return (
    <div className="lecture-hall-manager-card">
      <div className="card-header">
        <h3>Lecture Hall Manager</h3>
        <button onClick={handleAddNew} className="btn-add-new">Add New Hall</button>
      </div>
      
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Hall name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <label className="pagination-select">
          Show:
          <select value={hallsPerPage} onChange={(e) => setHallsPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>
          entries
        </label>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Hall Name</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((hall) => (
              <tr key={hall.id}>
                <td>{hall.name}</td>
                <td>{hall.capacity}</td>
                <td>
                  <button onClick={() => handleEdit(hall)} className="btn-edit">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{currentHall.id ? 'Edit Lecture Hall' : 'Add New Lecture Hall'}</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>Hall Name</label>
                <input type="text" name="name" value={currentHall.name} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" name="capacity" value={currentHall.capacity} onChange={handleFormChange} />
              </div>

              <fieldset>
                <legend>Weekly Schedule</legend>
                {Object.keys(currentHall.schedule).map((day) => (
                  <div key={day} className="day-schedule-container">
                    <div className="day-header">
                      <span className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <button onClick={() => addSlot(day)} className="btn-add-slot">+</button>
                    </div>
                    {currentHall.schedule[day].map((slot, index) => (
                      <div key={index} className="schedule-row">
                        <label>Open: <input type="time" value={slot.open} onChange={(e) => handleTimeChange(day, index, 'open', e.target.value)} /></label>
                        <label>Close: <input type="time" value={slot.close} onChange={(e) => handleTimeChange(day, index, 'close', e.target.value)} /></label>
                        <button onClick={() => removeSlot(day, index)} className="btn-remove-slot" disabled={currentHall.schedule[day].length <= 1}>-</button>
                      </div>
                    ))}
                  </div>
                ))}
              </fieldset>
            </div>
            <div className="modal-actions">
              <button onClick={handleSave} className="btn-save">Save Changes</button>
              <button onClick={handleCloseModal} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureHallManager;
