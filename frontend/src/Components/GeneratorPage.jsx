import React, { useState, useEffect } from 'react';
import { generateSchedule } from '../services/apiService'; // Using a single, flexible service function
import '../Styles/GeneratorPage.css';

const DataSourceSelector = ({ title, storageKey, source, setSource, onFileChange, selectedFile }) => {
    const [isDataAvailable, setIsDataAvailable] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        setIsDataAvailable(savedData && JSON.parse(savedData).length > 0);
    }, [storageKey]);

    return (
        <div className="file-upload-box">
            <label>{title}</label>
            <div className="source-options">
                <label>
                    <input type="radio" name={storageKey} value="upload" checked={source === 'upload'} onChange={(e) => setSource(e.target.value)} />
                    Upload New File
                </label>
                <label className={!isDataAvailable ? 'disabled' : ''}>
                    <input type="radio" name={storageKey} value="storage" checked={source === 'storage'} onChange={(e) => setSource(e.target.value)} disabled={!isDataAvailable} />
                    Use Saved Data
                    {!isDataAvailable && <span className="tooltip"> (No data saved)</span>}
                </label>
            </div>
            {source === 'upload' && (
                <div className="file-input-container">
                     <input id={storageKey} type="file" onChange={onFileChange} accept=".xlsx, .csv" />
                     {selectedFile && <span className="file-name-display">{selectedFile.name}</span>}
                </div>
            )}
        </div>
    );
};


const GeneratorPage = () => {
    const [courseDataSource, setCourseDataSource] = useState('upload');
    const [hallDataSource, setHallDataSource] = useState('upload');
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
            // Determine course data source
            let coursePayload = null;
            if (courseDataSource === 'upload') {
                if (!courseFile) throw new Error('Please select a course file to upload.');
                coursePayload = courseFile;
            } else {
                const data = localStorage.getItem('courseScheduleData');
                if (!data) throw new Error('No saved course data found.');
                coursePayload = JSON.parse(data);
            }

            // Determine hall data source
            let hallPayload = null;
            if (hallDataSource === 'upload') {
                if (!hallFile) throw new Error('Please select a lecture hall file to upload.');
                hallPayload = hallFile;
            } else {
                const data = localStorage.getItem('lectureHallManagerData');
                if (!data) throw new Error('No saved lecture hall data found.');
                hallPayload = JSON.parse(data);
            }
            
            // Call the single, flexible API service function
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
                <p>Choose your data source and generate the master schedule.</p>
            </header>

            <div className="generator-card">
                <form onSubmit={handleSubmit}>
                    <div className="upload-area">
                        <DataSourceSelector 
                            title="Course Schedule Data"
                            storageKey="courseScheduleData"
                            source={courseDataSource}
                            setSource={setCourseDataSource}
                            onFileChange={(e) => setCourseFile(e.target.files[0])}
                            selectedFile={courseFile}
                        />
                        <DataSourceSelector 
                            title="Lecture Hall Data"
                            storageKey="lectureHallManagerData" 
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
                    <p>{result.message}</p>
                    <pre>{JSON.stringify(result.generated_assignments, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default GeneratorPage;
