import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSchedule, getLectureHalls } from '../services/apiService';
import '../Styles/GeneratorPage.css';

// Reusable component for selecting data source
const DataSourceSelector = ({ title, savedDataLabel, storageKey, source, setSource, onFileChange, selectedFile }) => {
    // ... (omitted for brevity - no changes from previous version)
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

    const [courseDataSource, setCourseDataSource] = useState('upload');
    const [hallDataSource, setHallDataSource] = useState('saved');
    const [courseFile, setCourseFile] = useState(null);
    const [hallFile, setHallFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Updated state for new features
    const [convenienceFactor, setConvenienceFactor] = useState(50);
    const [allBuildings, setAllBuildings] = useState([]);
    const [lecturePriorities, setLecturePriorities] = useState([]);
    const [tutorialPriorities, setTutorialPriorities] = useState([]);

    useEffect(() => {
        const fetchBuildingNames = async () => {
            try {
                const halls = await getLectureHalls();
                const uniqueBuildingNames = [...new Set(halls.map(hall => hall.building))];
                setAllBuildings(uniqueBuildingNames.sort());
            } catch (err) {
                console.error("Could not fetch building names:", err);
                setError("Could not load building list for prioritization.");
            }
        };
        fetchBuildingNames();
    }, []);
    
    const handleConvenienceChange = (e) => {
        const value = Math.max(0, Math.min(100, Number(e.target.value)));
        setConvenienceFactor(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let coursePayload = null;
            if (courseDataSource === 'upload') {
                if (!courseFile) throw new Error('Please select a course file to upload.');
                coursePayload = courseFile;
            } else {
                const data = localStorage.getItem('courseScheduleData');
                if (!data) throw new Error('No saved course data found in your browser.');
                coursePayload = JSON.parse(data);
            }

            let hallPayload = null;
            if (hallDataSource === 'upload') {
                if (!hallFile) throw new Error('Please select a lecture hall file to upload.');
                hallPayload = hallFile;
            } else {
                hallPayload = await getLectureHalls();
                if (!hallPayload || hallPayload.length === 0) {
                    throw new Error('No lecture hall data found in the database.');
                }
            }

            const response = await generateSchedule(coursePayload, hallPayload, convenienceFactor, lecturePriorities, tutorialPriorities);
            localStorage.setItem('latestScheduleResult', JSON.stringify(response));
            navigate('/results', { state: { schedule: response } });

        } catch (err) {
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