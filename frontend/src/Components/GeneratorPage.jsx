// GeneratorPage.jsx (Updated)

import React, { useState, useEffect } from 'react';
// UPDATED: Import getLectureHalls to fetch data from the database
import { generateSchedule, getLectureHalls } from '../services/apiService';
import '../Styles/GeneratorPage.css';

// A reusable sub-component for selecting the data source
const DataSourceSelector = ({ title, savedDataLabel, storageKey, source, setSource, onFileChange, selectedFile }) => {
    const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(false);

    // This check is now only relevant for data sources that use localStorage (like courses)
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
                // UPDATED: Replaced default file input with a modern, styled version
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


const GeneratorPage = () => {
    // UPDATED: Set the default hall data source to 'saved' (database)
    const [courseDataSource, setCourseDataSource] = useState('upload');
    const [hallDataSource, setHallDataSource] = useState('saved'); 
    const [courseFile, setCourseFile] = useState(null);
    const [hallFile, setHallFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            // --- Determine the payload for course data (uses localStorage) ---
            let coursePayload = null;
            if (courseDataSource === 'upload') {
                if (!courseFile) throw new Error('Please select a course file to upload.');
                coursePayload = courseFile;
            } else { // 'saved'
                const data = localStorage.getItem('courseScheduleData');
                if (!data) throw new Error('No saved course data found in your browser.');
                coursePayload = JSON.parse(data);
            }

            // --- UPDATED: Determine the payload for hall data (uses database) ---
            let hallPayload = null;
            if (hallDataSource === 'upload') {
                if (!hallFile) throw new Error('Please select a lecture hall file to upload.');
                hallPayload = hallFile;
            } else { // 'saved' -> This now means fetch from the database
                console.log('Fetching lecture halls from the database...');
                hallPayload = await getLectureHalls();
                if (!hallPayload || hallPayload.length === 0) {
                    throw new Error('No lecture hall data found in the database.');
                }
            }
            
            console.log('Sending data to C++ engine...');
            const response = await generateSchedule(coursePayload, hallPayload);
            setResult(response);

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
                <p>Choose your data sources and generate the master schedule.</p>
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
                            // No storageKey needed as we fetch from DB
                            source={hallDataSource}
                            setSource={setHallDataSource}
                            onFileChange={(e) => setHallFile(e.target.files[0])}
                            selectedFile={hallFile}
                        />
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

            {result && (
                <div className="response-box result-box">
                    <h4>Generation Result</h4>
                    <p>{result.message || 'Schedule generated successfully.'}</p>
                    {/* Only show the pre block if there are assignments */}
                    {result.generated_assignments && result.generated_assignments.length > 0 &&
                        <pre>{JSON.stringify(result.generated_assignments, null, 2)}</pre>
                    }
                </div>
            )}
        </div>
    );
};

export default GeneratorPage;