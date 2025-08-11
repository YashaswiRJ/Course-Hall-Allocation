import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSchedule, getLectureHalls } from '../services/apiService';
import '../Styles/GeneratorPage.css';

// This reusable sub-component allows users to select their data source.
const DataSourceSelector = ({ title, savedDataLabel, storageKey, source, setSource, onFileChange, selectedFile }) => {
    const [isLocalStorageAvailable, setIsLocalStorageAvailable] = React.useState(false);

    React.useEffect(() => {
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


const GeneratorPage = () => {
    const navigate = useNavigate();

    const [courseDataSource, setCourseDataSource] = React.useState('upload');
    const [hallDataSource, setHallDataSource] = React.useState('saved');
    const [courseFile, setCourseFile] = React.useState(null);
    const [hallFile, setHallFile] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Determine the payload for course data (from file or localStorage)
            let coursePayload = null;
            if (courseDataSource === 'upload') {
                if (!courseFile) throw new Error('Please select a course file to upload.');
                coursePayload = courseFile;
            } else { // 'saved'
                const data = localStorage.getItem('courseScheduleData');
                if (!data) throw new Error('No saved course data found in your browser.');
                coursePayload = JSON.parse(data);
            }

            // Determine the payload for hall data (from file or database)
            let hallPayload = null;
            if (hallDataSource === 'upload') {
                if (!hallFile) throw new Error('Please select a lecture hall file to upload.');
                hallPayload = hallFile;
            } else { // 'saved' means fetch from the database via the API service
                hallPayload = await getLectureHalls();
                if (!hallPayload || hallPayload.length === 0) {
                    throw new Error('No lecture hall data found in the database.');
                }
            }

            // Call the API service to generate the schedule
            const response = await generateSchedule(coursePayload, hallPayload);

            // Save the successful result to localStorage to enable "View Last Result" links
            localStorage.setItem('latestScheduleResult', JSON.stringify(response));

            // On success, navigate to the results page and pass the response data
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
        </div>
    );
};

export default GeneratorPage;