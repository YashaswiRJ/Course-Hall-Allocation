import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../Styles/UploadCsv.css';

const UploadPage = ({ title, storageKey, requiredColumns }) => {
    // State for file handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [headers, setHeaders] = useState([]);

    // State for UI feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // State for table controls
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Effect to load existing data from localStorage on component mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData && parsedData.length > 0) {
                    setTableData(parsedData);
                    setHeaders(Object.keys(parsedData[0]));
                    setSuccess('Loaded previously saved data from your browser.');
                }
            }
        } catch (e) {
            console.error("Failed to load or parse data from localStorage", e);
            setError("Could not load previously saved data.");
        }
    }, [storageKey]);

    // --- File Handling Logic ---
    const processFile = (file) => {
        if (!file) return;

        setError('');
        setSuccess('');
        setSelectedFile(file);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    throw new Error("The selected file is empty or could not be read.");
                }

                const fileHeaders = Object.keys(json[0]);
                const missingColumns = requiredColumns.filter(col => !fileHeaders.includes(col));

                if (missingColumns.length > 0) {
                    throw new Error(`The file is missing required columns: ${missingColumns.join(', ')}`);
                }

                setTableData(json);
                setHeaders(fileHeaders);
                setSuccess(`Successfully parsed "${file.name}". Click "Save Data" to store it.`);

            } catch (err) {
                setError(err.message || 'An error occurred while parsing the file.');
                setSelectedFile(null);
                setTableData([]);
                setHeaders([]);
            } finally {
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsParsing(false);
        }
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleSaveToStorage = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(tableData));
            setSuccess('Data has been successfully saved to your browser!');
            setSelectedFile(null);
        } catch (e) {
            setError('Could not save data to browser storage. It might be full.');
            console.error("Error saving to localStorage", e);
        }
    };
    
    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all data for this page? This cannot be undone.")) {
            localStorage.removeItem(storageKey);
            setTableData([]);
            setHeaders([]);
            setSelectedFile(null);
            setError('');
            setSuccess('Data has been cleared.');
        }
    };

    // --- Drag and Drop Handlers ---
    const handleDragEvents = (e, isEntering) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };
    
    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    // --- Memoized calculations for table display ---
    const filteredData = useMemo(() => {
        if (!searchTerm) return tableData;
        return tableData.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [tableData, searchTerm]);

    const currentTableData = useMemo(() => {
        const firstRowIndex = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(firstRowIndex, firstRowIndex + rowsPerPage);
    }, [currentPage, rowsPerPage, filteredData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // --- Render Logic ---
    return (
        <div className="upload-page-container">
            <header className="main-header">
                <h1>{title}</h1>
                <p>Upload, preview, and save your data file.</p>
            </header>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <div className="upload-section-card">
                <div 
                    className={`file-input-container ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDrop={handleDrop}
                >
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={handleFileChange}
                            disabled={isParsing}
                        />
                        <label htmlFor="file-upload" className="file-input-label">
                            <span className="drop-icon">📤</span>
                            <span>{isParsing ? 'Processing...' : (selectedFile ? selectedFile.name : 'Choose a file or drag it here')}</span>
                            <small>.xlsx, .csv</small>
                        </label>
                    </div>

                    <div className="file-actions">
                        <button
                            className="btn-save-storage"
                            onClick={handleSaveToStorage}
                            disabled={tableData.length === 0 || isParsing}
                            title={tableData.length === 0 ? "Please upload a valid file first" : "Save the parsed data"}
                        >
                            Save Data
                        </button>
                        <button 
                            className="btn-clear-storage"
                            onClick={handleClearData}
                            disabled={tableData.length === 0 || isParsing}
                            title={tableData.length === 0 ? "No data to clear" : "Clear all saved data"}
                        >
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>

            {tableData.length > 0 && (
                <div className="data-display-section upload-section-card">
                    <div className="data-controls">
                        <input
                            type="text"
                            className="table-search-input"
                            placeholder="Search in table..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label className="pagination-select">
                            Show:
                            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                            </select>
                            entries
                        </label>
                    </div>
                    
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    {headers.map(header => <th key={header}>{header}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {currentTableData.map((row, index) => (
                                    <tr key={index}>
                                        {headers.map(header => <td key={header}>{String(row[header] ?? '')}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;