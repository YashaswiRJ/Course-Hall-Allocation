import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { generateSchedule, getLectureHalls } from '../services/apiService';
import '../Styles/GeneratorPage.css';

// Reusable component for selecting data source
const DataSourceSelector = ({ title, savedDataLabel, storageKey, source, setSource, onFileChange, selectedFile }) => {
    const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(false);

    useEffect(() => {
        if (storageKey) {
            const savedData = localStorage.getItem(storageKey);
            setIsLocalStorageAvailable(savedData && JSON.parse(savedData).length > 0);
        }
    }, [storageKey]);

    const isSavedOptionDisabled = storageKey ? !isLocalStorageAvailable : false;

    return (
        <div className="file-upload-box">
            <label className="box-title">{title}</label>
            <div className="source-options">
                <label>
                    <input type="radio" name={title} value="upload" checked={source === 'upload'} onChange={(e) => setSource(e.target.value)} />
                    Upload New File
                </label>
                <label className={isSavedOptionDisabled ? 'disabled' : ''}>
                    <input type="radio" name={title} value="saved" checked={source === 'saved'} onChange={(e) => setSource(e.target.value)} disabled={isSavedOptionDisabled} />
                    {savedDataLabel}
                    {isSavedOptionDisabled && <span className="tooltip"> (No data saved)</span>}
                </label>
            </div>
            {source === 'upload' && (
                <div className="file-input-wrapper">
                    <label htmlFor={title} className="file-input-label">
                        <span className="file-input-icon">📤</span>
                        <span>{selectedFile ? selectedFile.name : 'Click to select a file'}</span>
                    </label>
                    <input id={title} type="file" onChange={onFileChange} accept=".xlsx, .csv" />
                </div>
            )}
        </div>
    );
};

// Reusable component for managing a priority list
const BuildingPriorityManager = ({ title, priorities, setPriorities, allBuildings }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = (building) => {
        setPriorities([...priorities, building]);
    };

    const handleRemove = (index) => {
        setPriorities(priorities.filter((_, i) => i !== index));
    };

    const moveItem = (index, direction) => {
        const newPriorities = [...priorities];
        const item = newPriorities[index];
        const swapIndex = index + direction;
        if (swapIndex < 0 || swapIndex >= newPriorities.length) return;
        newPriorities[index] = newPriorities[swapIndex];
        newPriorities[swapIndex] = item;
        setPriorities(newPriorities);
    };

    const availableBuildings = allBuildings
        .filter(b => !priorities.includes(b))
        .filter(b => b.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="building-priority-container">
            <label>{title}</label>
            <div className="priority-columns">
                <div className="building-list-box">
                    <h4>Available Buildings</h4>
                    <input
                        type="text"
                        placeholder="Search buildings..."
                        className="building-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul>
                        {availableBuildings.map(b => (
                            <li key={b}>
                                <span>{b}</span>
                                <button type="button" className="btn-add" onClick={() => handleAdd(b)}>+</button>
                            </li>
                        ))}
                        {availableBuildings.length === 0 && <li className="empty-list">No buildings to add.</li>}
                    </ul>
                </div>
                <div className="building-list-box">
                    <h4>Priority Order</h4>
                    <ul>
                        {priorities.map((b, index) => (
                            <li key={b}>
                                <span className="priority-rank">{index + 1}</span>
                                <span>{b}</span>
                                <div className="priority-controls">
                                    <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</button>
                                    <button type="button" onClick={() => moveItem(index, 1)} disabled={index === priorities.length - 1}>↓</button>
                                    <button type="button" className="btn-remove" onClick={() => handleRemove(index)}>×</button>
                                </div>
                            </li>
                        ))}
                        {priorities.length === 0 && <li className="empty-list">Add buildings from the left.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const GeneratorPage = () => {
    const navigate = useNavigate();

    const getInitialSource = (storageKey) => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData && JSON.parse(savedData).length > 0) {
                return 'saved';
            }
        } catch (e) {
            console.error(`Error reading ${storageKey} from localStorage`, e);
        }
        return 'upload';
    };

    const [courseDataSource, setCourseDataSource] = useState(() => getInitialSource('courseScheduleData'));
    const [hallDataSource, setHallDataSource] = useState('saved');
    const [constraintDataSource, setConstraintDataSource] = useState(() => getInitialSource('preallocatedData'));

    const [courseFile, setCourseFile] = useState(null);
    const [hallFile, setHallFile] = useState(null);
    const [constraintFile, setConstraintFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [convenienceFactor, setConvenienceFactor] = useState(15);
    const [allBuildings, setAllBuildings] = useState([]);
    const [lecturePriorities, setLecturePriorities] = useState([]);
    const [tutorialPriorities, setTutorialPriorities] = useState([]);
    const [useCachedPriorities, setUseCachedPriorities] = useState(true);

    // --- Caching and Data Loading Logic ---

    // EFFECT 1: Fetch the list of buildings from the database once on mount.
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const halls = await getLectureHalls();
                const currentBuildingList = [...new Set(halls.map(hall => hall.building))].sort();
                setAllBuildings(currentBuildingList);
            } catch (err) {
                console.error("Could not fetch initial data:", err);
                setError("Could not load building list for prioritization.");
            }
        };
        fetchBuildings();
    }, []);

    // EFFECT 2 (FIXED): This effect now handles LOADING or CLEARING priorities.
    // It runs when the building list is ready OR when the toggle is changed.
    useEffect(() => {
        if (useCachedPriorities && allBuildings.length > 0) {
            const validatePriorities = (saved, current) => {
                if (!Array.isArray(saved)) return false;
                const currentSet = new Set(current);
                return saved.every(building => currentSet.has(building));
            };

            const savedLec = JSON.parse(localStorage.getItem('lectureBuildingPriorities') || 'null');
            if (validatePriorities(savedLec, allBuildings)) {
                setLecturePriorities(savedLec);
            }

            const savedTut = JSON.parse(localStorage.getItem('tutorialBuildingPriorities') || 'null');
            if (validatePriorities(savedTut, allBuildings)) {
                setTutorialPriorities(savedTut);
            }
        } else if (!useCachedPriorities) {
            setLecturePriorities([]);
            setTutorialPriorities([]);
        }
    }, [allBuildings, useCachedPriorities]); // Dependencies trigger this logic correctly

    // EFFECT 3: This effect handles SAVING priorities to localStorage whenever they change.
    useEffect(() => {
        if (useCachedPriorities) {
            localStorage.setItem('lectureBuildingPriorities', JSON.stringify(lecturePriorities));
            localStorage.setItem('tutorialBuildingPriorities', JSON.stringify(tutorialPriorities));
        } else {
            localStorage.removeItem('lectureBuildingPriorities');
            localStorage.removeItem('tutorialBuildingPriorities');
        }
    }, [lecturePriorities, tutorialPriorities, useCachedPriorities]);


    // --- Event Handlers ---

    // The toggle handler is now much simpler. It just updates the state.
    const handleCacheToggle = (e) => {
        setUseCachedPriorities(e.target.checked);
    };

    const handleConvenienceChange = (e) => {
        const value = Math.max(0, Math.min(100, Number(e.target.value)));
        setConvenienceFactor(value);
    };
    
    // ... parseFileToJson and handleSubmit functions remain unchanged ...
    const parseFileToJson = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                return resolve([]);
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    resolve(json);
                } catch (err) {
                    reject(new Error("Error parsing the file."));
                }
            };
            reader.onerror = () => {
                reject(new Error("Failed to read the file."));
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let coursePayload = [];
            if (courseDataSource === 'upload') {
                if (!courseFile) throw new Error('Please select a course file to upload.');
                coursePayload = await parseFileToJson(courseFile);
            } else {
                const data = localStorage.getItem('courseScheduleData');
                if (!data || JSON.parse(data).length === 0) throw new Error('No saved course data found in your browser.');
                coursePayload = JSON.parse(data);
            }

            let hallPayload = [];
            if (hallDataSource === 'upload') {
                if (!hallFile) throw new Error('Please select a lecture hall file to upload.');
                hallPayload = await parseFileToJson(hallFile);
            } else {
                hallPayload = await getLectureHalls();
                if (!hallPayload || hallPayload.length === 0) {
                    throw new Error('No lecture hall data found in the database.');
                }
            }

            let constraintPayload = [];
            if (constraintDataSource === 'upload') {
                constraintPayload = await parseFileToJson(constraintFile);
            } else {
                const data = localStorage.getItem('preallocatedData');
                if (data) {
                    constraintPayload = JSON.parse(data);
                }
            }

            const response = await generateSchedule(coursePayload, hallPayload, convenienceFactor, lecturePriorities, tutorialPriorities, constraintPayload);
            localStorage.setItem('latestScheduleResult', JSON.stringify(response));
            navigate('/results', { state: { schedule: response } });

        } catch (err)
 {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="generator-page-container">
            <header className="main-header">
                <h1>Schedule Generator</h1>
                <p>Choose your data sources, set preferences, and generate the master schedule.</p>
            </header>

            <div className="generator-card">
                <form onSubmit={handleSubmit}>
                    <div className="upload-area">
                        <DataSourceSelector
                            title="Course Schedule Data"
                            savedDataLabel="Use Saved Data"
                            storageKey="courseScheduleData"
                            source={courseDataSource}
                            setSource={setCourseDataSource}
                            onFileChange={(e) => setCourseFile(e.target.files[0])}
                            selectedFile={courseFile}
                        />
                        <DataSourceSelector
                            title="Lecture Hall Data"
                            savedDataLabel="Use Database Data"
                            source={hallDataSource}
                            setSource={setHallDataSource}
                            onFileChange={(e) => setHallFile(e.target.files[0])}
                            selectedFile={hallFile}
                        />
                        <DataSourceSelector
                            title="Pre-allocated Constraints (Optional)"
                            savedDataLabel="Use Saved Constraints"
                            storageKey="preallocatedData"
                            source={constraintDataSource}
                            setSource={setConstraintDataSource}
                            onFileChange={(e) => setConstraintFile(e.target.files[0])}
                            selectedFile={constraintFile}
                        />
                    </div>

                    <div className="options-card">
                        <h3>Generation Options</h3>
                        <p className="options-description">Set the order of buildings to prioritize for class allocation and define student convenience.</p>

                        <div className="convenience-factor-container">
                            <label htmlFor="convenience-input">Convenience Factor</label>
                            <p>How much to prioritize minimizing distance between consecutive classes for students (0-100%).</p>
                            <div className="convenience-input-group">
                                <input
                                    type="range"
                                    id="convenience-slider"
                                    min="0"
                                    max="100"
                                    value={convenienceFactor}
                                    onChange={handleConvenienceChange}
                                />
                                <input 
                                    type="number"
                                    id="convenience-input"
                                    min="0"
                                    max="100"
                                    value={convenienceFactor}
                                    onChange={handleConvenienceChange}
                                />
                                <span>%</span>
                            </div>
                        </div>

                        <div className="priority-section">
                            <div className="priority-caching-toggle">
                                <label htmlFor="cache-toggle">
                                    Use Saved Priorities
                                    <span className="tooltip">(Automatically loads and saves your priority lists if consistent with current buildings)</span>
                                </label>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        id="cache-toggle" 
                                        checked={useCachedPriorities} 
                                        onChange={handleCacheToggle} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            <BuildingPriorityManager
                                title="Lecture Building Priority"
                                priorities={lecturePriorities}
                                setPriorities={setLecturePriorities}
                                allBuildings={allBuildings}
                            />
                            <BuildingPriorityManager
                                title="Tutorial Building Priority"
                                priorities={tutorialPriorities}
                                setPriorities={setTutorialPriorities}
                                allBuildings={allBuildings}
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="generate-button" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Schedule'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="response-box error-box">
                    <h4>Error</h4>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default GeneratorPage;