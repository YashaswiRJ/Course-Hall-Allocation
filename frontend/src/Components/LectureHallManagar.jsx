// src/Components/LectureHallManager.jsx
import React, { useState, useMemo, useEffect } from 'react';
import "../Styles/LectureHallManager.css";

// --- API Service Functions ---
const API_BASE_URL = 'http://172.27.5.210:5000/api';

const getLectureHalls = async () => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch lecture halls.');
    }
    return response.json();
};

const createLectureHall = async (hallData) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hallData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create lecture hall.');
    }
    return response.json();
};

const updateLectureHall = async (id, hallData) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hallData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update lecture hall.');
    }
    return response.json();
};

const deleteLectureHall = async (id, building) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}?building=${building}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete lecture hall.');
    }
};

// --- NEW/UPDATED API Service Functions for Buildings ---
const createBuilding = async (buildingData) => {
    const response = await fetch(`${API_BASE_URL}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildingData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create building.');
    }
    return response.json();
};

const deleteBuilding = async (buildingName) => {
    const response = await fetch(`${API_BASE_URL}/buildings/${encodeURIComponent(buildingName)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete building.');
    }
};


const BuildingHallManager = ({ buildingName, hallsForBuilding, onBack, refreshHalls }) => {
    // ... (This component remains unchanged as its logic was already sound)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHall, setCurrentHall] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hallsPerPage, setHallsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHalls = useMemo(() => {
        return hallsForBuilding.filter(hall =>
            hall.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [hallsForBuilding, searchTerm]);

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
                await deleteLectureHall(hallId, buildingName);
                refreshHalls();
            } catch (err) {
                alert(err.message || 'Failed to delete the hall.');
                console.error(err);
            }
        }
    };

    const handleAddNew = () => {
        setCurrentHall({
            name: '',
            building: buildingName,
            capacity: 100,
            schedule: {
                monday: [{ open: '08:00', close: '20:00' }],
                tuesday: [{ open: '08:00', close: '20:00' }],
                wednesday: [{ open: '08:00', close: '20:00' }],
                thursday: [{ open: '08:00', close: '20:00' }],
                friday: [{ open: '08:00', close: '20:00' }],
            },
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentHall(null);
    };

    const handleSave = async () => {
        if (!currentHall.name || !currentHall.building || !currentHall.capacity) {
            alert('Hall Name, Building, and Capacity are required.');
            return;
        }
        try {
            if (currentHall.id) {
                await updateLectureHall(currentHall.id, currentHall);
            } else {
                await createLectureHall(currentHall);
            }
            handleCloseModal();
            refreshHalls();
        } catch (err) {
            alert(err.message || 'Failed to save the hall.');
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
        newSchedule[day].push({ open: '08:00', close: '20:00' });
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
        <>
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onBack} className="btn-back">← Back</button>
                    <h3>Halls in: {buildingName}</h3>
                </div>
                <button onClick={handleAddNew} className="btn-add-new">Add New Hall</button>
            </div>

            <div className="controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by Hall Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <label className="pagination-select">
                    Show:
                    <select value={hallsPerPage} onChange={(e) => setHallsPerPage(Number(e.target.value))}>
                        <option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={25}>25</option>
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
                       <label>Building</label>
                       <input type="text" name="building" value={currentHall.building} readOnly />
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
        </>
    );
};


const BuildingSelectionView = ({ buildings, onSelectBuilding, onAddBuilding, onDeleteBuilding }) => {
    const buildingNames = Object.keys(buildings).sort();

    return (
        <>
            <div className="card-header">
                <h3>Select a Building to Manage</h3>
                <button onClick={onAddBuilding} className="btn-add-new">Add New Building</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Building Name</th>
                            <th>Number of Halls</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildingNames.length > 0 ? (
                            buildingNames.map(name => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>{buildings[name].length}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => onSelectBuilding(name)} className="btn-manage">
                                            Manage Halls →
                                        </button>
                                        <button onClick={() => onDeleteBuilding(name)} className="btn-delete btn-delete-building">
                                            Delete Building
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="empty-table-message">
                                <td colSpan="3">No buildings found. Try adding a new one!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};


const LectureHallManager = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
    
    // UPDATED: State for the new building and its initial hall
    const [newBuildingData, setNewBuildingData] = useState({
        name: '',
        initialHall: {
            name: '',
            capacity: 100,
            schedule: {
                monday: [{ open: '08:00', close: '20:00' }],
                tuesday: [{ open: '08:00', close: '20:00' }],
                wednesday: [{ open: '08:00', close: '20:00' }],
                thursday: [{ open: '08:00', close: '20:00' }],
                friday: [{ open: '08:00', close: '20:00' }],
            }
        }
    });

    const fetchHalls = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Trying to fetch the lhc data');
            const data = await getLectureHalls();
            console.log('hall data set hai: ', data);
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

    const buildings = useMemo(() => {
        return halls.reduce((acc, hall) => {
            const { building } = hall;
            if (!acc[building]) {
                acc[building] = [];
            }
            acc[building].push(hall);
            return acc;
        }, {});
    }, [halls]);

    const handleOpenAddBuildingModal = () => {
        // Reset the form state when opening the modal
        setNewBuildingData({
            name: '',
            initialHall: { name: '', capacity: 100, schedule: {
                monday: [{ open: '08:00', close: '20:00' }],
                tuesday: [{ open: '08:00', close: '20:00' }],
                wednesday: [{ open: '08:00', close: '20:00' }],
                thursday: [{ open: '08:00', close: '20:00' }],
                friday: [{ open: '08:00', close: '20:00' }],
            }}
        });
        setIsAddBuildingModalOpen(true);
    };

    const handleCloseAddBuildingModal = () => {
        setIsAddBuildingModalOpen(false);
    };
    
    // UPDATED: Handle change for the new building form
    const handleNewBuildingChange = (e) => {
        const { name, value } = e.target;
        setNewBuildingData(prev => ({ ...prev, [name]: value }));
    };

    const handleInitialHallChange = (e) => {
        const { name, value } = e.target;
        setNewBuildingData(prev => ({
            ...prev,
            initialHall: {
                ...prev.initialHall,
                [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
            }
        }));
    };
    
    // UPDATED: Handler to save the new building and its first hall
    const handleSaveNewBuilding = async () => {
        if (!newBuildingData.name.trim() || !newBuildingData.initialHall.name.trim()) {
            alert('Building Name and the Initial Hall Name cannot be empty.');
            return;
        }
        try {
            await createBuilding(newBuildingData);
            handleCloseAddBuildingModal();
            fetchHalls(); // Refresh data to show the new building
        } catch (err) {
            alert(err.message || 'Failed to save the new building.');
            console.error(err);
        }
    };
    
    const handleDeleteBuilding = async (buildingName) => {
        const promptMessage = `This action will permanently delete the building "${buildingName}" and ALL lecture halls within it. This cannot be undone.\n\nTo confirm, please type exactly: DELETE ${buildingName}`;
        const confirmation = prompt(promptMessage);

        if (confirmation === `DELETE ${buildingName}`) {
            try {
                setLoading(true);
                await deleteBuilding(buildingName);
                fetchHalls();
            } catch (err) {
                setLoading(false);
                alert(err.message || 'Failed to delete the building.');
                console.error(err);
            }
        } else if (confirmation !== null) {
            alert('The confirmation text did not match. Deletion cancelled.');
        }
    };

    if (loading) { /* ... loading JSX unchanged ... */ }
    if (error) { /* ... error JSX unchanged ... */ }

    return (
        <div className="lecture-hall-manager-card">
            {selectedBuilding ? (
                <BuildingHallManager
                    buildingName={selectedBuilding}
                    hallsForBuilding={buildings[selectedBuilding] || []}
                    onBack={() => setSelectedBuilding(null)}
                    refreshHalls={fetchHalls}
                />
            ) : (
                <BuildingSelectionView
                    buildings={buildings}
                    onSelectBuilding={setSelectedBuilding}
                    onAddBuilding={handleOpenAddBuildingModal}
                    onDeleteBuilding={handleDeleteBuilding}
                />
            )}

            {isAddBuildingModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Building</h2>
                        <div className="modal-body">
                            <fieldset>
                                <legend>Building Details</legend>
                                <div className="form-group">
                                    <label>Building Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={newBuildingData.name} 
                                        onChange={handleNewBuildingChange}
                                        placeholder="e.g., Lecture Hall Complex"
                                    />
                                </div>
                            </fieldset>
                            
                            <fieldset>
                                <legend>Initial Lecture Hall</legend>
                                <p className="fieldset-description">Every building must start with at least one lecture hall.</p>
                                <div className="form-group">
                                    <label>Hall Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={newBuildingData.initialHall.name}
                                        onChange={handleInitialHallChange}
                                        placeholder="e.g., L-101"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hall Capacity</label>
                                    <input 
                                        type="number"
                                        name="capacity"
                                        value={newBuildingData.initialHall.capacity}
                                        onChange={handleInitialHallChange}
                                    />
                                </div>
                            </fieldset>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSaveNewBuilding} className="btn-save">Save Building</button>
                            <button onClick={handleCloseAddBuildingModal} className="btn-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LectureHallManager;