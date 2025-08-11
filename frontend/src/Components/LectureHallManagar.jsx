// === LectureHallManager.jsx (Updated) ===
import React, { useState, useMemo, useEffect } from 'react';
import '../Styles/LectureHallManager.css';
import { getLectureHalls, createLectureHall, updateLectureHall, deleteLectureHall } from '../services/apiService'; 

// Main Component
const LectureHallManager = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHall, setCurrentHall] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hallsPerPage, setHallsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHalls = async () => {
      try {
          setLoading(true);
          setError(null);
          const data = await getLectureHalls();
          setHalls(data);
      } catch (err) {
          setError('Failed to load data from the server. Please check your connection and try again.');
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

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

  const handleDelete = async (hallId) => {
      if (window.confirm('Are you sure you want to delete this lecture hall? This action cannot be undone.')) {
          try {
              await deleteLectureHall(hallId);
              fetchHalls();
          } catch (err) {
              alert('Failed to delete the hall.');
              console.error(err);
          }
      }
  };

  const handleAddNew = () => {
    setCurrentHall({
      name: '', 
      capacity: 100,
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

  const handleSave = async () => {
    if (!currentHall.name || !currentHall.capacity) {
        alert('Hall Name and Capacity are required.');
        return;
    }
    try {
        if (currentHall.id) {
            await updateLectureHall(currentHall.id, currentHall);
        } else {
            await createLectureHall(currentHall);
        }
        handleCloseModal();
        fetchHalls();
    } catch (err) {
        alert('Failed to save the hall.');
        console.error(err);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentHall({ ...currentHall, [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value });
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

  // --- RENDER LOGIC with new states ---

  // Display a full-page loading spinner
  if (loading) {
    return (
        <div className="state-container">
            <div className="spinner"></div>
        </div>
    );
  }

  // Display a full-page error card
  if (error) {
      return (
        <div className="state-container">
            <div className="error-card">
                <span className="error-icon">⚠️</span>
                <h4>Oops! Something went wrong.</h4>
                <p>{error}</p>
                <button onClick={fetchHalls} className="btn-try-again">Try Again</button>
            </div>
        </div>
      );
  }

  // Main component render
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
            {currentTableData.length > 0 ? (
                currentTableData.map((hall) => (
                  <tr key={hall.id}>
                    <td>{hall.name}</td>
                    <td>{hall.capacity}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(hall)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(hall.id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                ))
            ) : (
                <tr className="empty-table-message">
                    <td colSpan="3">No lecture halls found. Try adding a new one!</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>
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