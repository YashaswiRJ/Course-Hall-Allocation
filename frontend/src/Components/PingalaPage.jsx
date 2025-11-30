import React, { useState, useEffect } from 'react';
import '../Styles/PingalaPage.css';

// Columns expected in the uploaded files
const REQUIRED_COLUMNS = [
    'Course Name',
    'Course Code',
    'Section',
    'Lecture Hall Allocated',
    'Type',
    'Schedule',
    'Modular Course',
    'Students Registered'
];

// --- Helper: Native CSV Parser (Fixed for JS Compatibility) ---
const parseCSV = (text) => {
    // Split by newline, handling both \n and \r\n
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];

    // Parse a single line, handling quotes and commas inside quotes
    const parseLine = (line) => {
        const result = [];
        let currentVal = '';
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (inQuote) {
                if (char === '"') {
                    // Check for double double-quotes (escaped quote)
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        currentVal += '"';
                        i++; // Skip the next quote
                    } else {
                        inQuote = false; // End of quoted section
                    }
                } else {
                    currentVal += char;
                }
            } else {
                if (char === '"') {
                    inQuote = true; // Start of quoted section
                } else if (char === ',') {
                    result.push(currentVal.trim()); // End of value
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
        }
        result.push(currentVal.trim()); // Push the last value
        return result;
    };

    const headers = parseLine(lines[0]);
    
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        const row = {};
        headers.forEach((h, i) => {
            // Clean up header name
            const headerName = h.replace(/^"|"$/g, '').trim();
            row[headerName] = values[i] || '';
        });
        return row;
    });
};

// --- LOGIC PORTED FROM C++ TO JS ---
const dayProcessing = (scheduleStr) => {
    if (!scheduleStr) return [];
    const days = [];
    for (let i = 0; i < scheduleStr.length; i++) {
        const char = scheduleStr[i];
        if (char === 'M') days.push("Monday");
        else if (char === 'W') days.push("Wednesday");
        else if (char === 'F') days.push("Friday");
        else if (char === 'T') {
            if (i + 1 < scheduleStr.length && scheduleStr[i+1] === 'h') {
                days.push("Thursday");
                i++; 
            } else {
                days.push("Tuesday");
            }
        }
    }
    return days;
};

// This function mimics your C++ main loop exactly
const processPingalaDataLocal = (data) => {
    return new Promise((resolve) => {
        // Use a slight timeout to allow UI to show "Processing..." state
        setTimeout(() => {
            const alreadySeenCourses = new Map(); // Mimics std::map
            const outputJson = {
                "Errored courses": [],
                "Formatted courses": []
            };
            console.log("Processing Pingala data locally", data);
            data.forEach(course => {
                // Safe string handling (mimicking .get<std::string>() or safe_string logic)
                const code = course["Course Code"] || "";
                const section = course["Section"] || "";
                const type = course["Type"] || "";
                const venue = course["Lecture Hall Allocated"] || "";
                const schedule = course["Schedule"] || "";

                // Construct unique key
                const uniqueKey = `${code}#${section}#${type}`;

                if (alreadySeenCourses.has(uniqueKey)) {
                    const existingVenue = alreadySeenCourses.get(uniqueKey);
                    
                    if (existingVenue === venue) {
                        // Duplicate entry, same venue -> skip
                        return;
                    } else {
                        // Conflict
                        outputJson["Errored courses"].push({
                            "Course": `${code} Section ${section} already allocated to ${existingVenue}`
                        });
                    }
                } else {
                    // New entry
                    alreadySeenCourses.set(uniqueKey, venue);

                    const days = dayProcessing(schedule);
                    days.forEach(day => {
                        outputJson["Formatted courses"].push({
                            "Course": code,
                            "Section": section,
                            "Class Type": "Lecture",
                            "Class": type,
                            "Venue": venue,
                            "Day": day
                        });
                    });
                }
            });

            resolve(outputJson);
        }, 500); // Fake delay for UX
    });
};

const PingalaPage = () => {
    // --- State: File Uploads ---
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    
    // --- State: Processing Results ---
    const [processResult, setProcessResult] = useState(null); // { "Formatted courses": [], "Errored courses": [] }
    const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'errored'
    
    // --- State: Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 1. Load data from localStorage on mount
    useEffect(() => {
        const savedFiles = localStorage.getItem('pingalaFiles');
        if (savedFiles) {
            try {
                setUploadedFiles(JSON.parse(savedFiles));
            } catch (e) {
                console.error("Failed to parse saved Pingala files", e);
            }
        }
    }, []);

    // 2. Save data to localStorage whenever uploadedFiles changes
    useEffect(() => {
        localStorage.setItem('pingalaFiles', JSON.stringify(uploadedFiles));
    }, [uploadedFiles]);

    // Helper: Generate Unique ID
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadStatus('Reading files...');

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                let data = [];
                
                // Simple check for CSV
                if (file.name.toLowerCase().endsWith('.csv')) {
                    data = parseCSV(bstr);
                } else {
                    alert(`File ${file.name} is not a CSV. This version supports CSV only.`);
                    return;
                }

                const newFile = {
                    id: generateId(),
                    fileName: file.name,
                    rowCount: data.length,
                    data: data
                };

                setUploadedFiles(prev => [...prev, newFile]);
            };
            reader.readAsText(file); // Changed to readAsText for CSV
        });
        setUploadStatus('');
    };

    const handleClearAll = () => {
        setUploadedFiles([]);
        setProcessResult(null);
        localStorage.removeItem('pingalaFiles');
    };

    const handleRemoveFile = (id) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    // --- Merging Data for Preview (Pre-processing) ---
    const getMergedData = () => {
        return uploadedFiles.reduce((acc, file) => [...acc, ...file.data], []);
    };

    // --- Processing Logic ---
    const handleProcess = async () => {
        setIsProcessing(true);
        setProcessResult(null); // Reset previous results

        try {
            const mergedData = getMergedData();
            if (mergedData.length === 0) {
                alert("No data to process!");
                setIsProcessing(false);
                return;
            }

            // --- CHANGED: Use Local JS logic instead of API ---
            const result = await processPingalaDataLocal(mergedData);
            
            setProcessResult(result);
            setCurrentPage(1); // Reset pagination
            setViewMode('formatted'); // Default to success view

        } catch (error) {
            console.error("Processing failed:", error);
            alert(`Processing failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Pagination Logic ---
    const getCurrentResultData = () => {
        if (!processResult) return [];
        return viewMode === 'formatted' 
            ? processResult["Formatted courses"] 
            : processResult["Errored courses"];
    };

    const totalRows = getCurrentResultData().length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = getCurrentResultData().slice(indexOfFirstRow, indexOfLastRow);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- Export Logic ---
    const handleDownload = (format) => {
        const dataToExport = getCurrentResultData();
        if (dataToExport.length === 0) {
            alert("No data to export in current view.");
            return;
        }

        const fileName = viewMode === 'formatted' ? 'Pingala_Schedule' : 'Pingala_Errors';

        // Helper to convert JSON to CSV
        const jsonToCSV = (arr) => {
            if (!arr.length) return '';
            const headers = Object.keys(arr[0]);
            const csvRows = [headers.join(',')];
            
            for (const row of arr) {
                const values = headers.map(header => {
                    const val = row[header];
                    // Escape quotes and wrap in quotes
                    const escaped = ('' + val).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }
            return csvRows.join('\n');
        };

        if (format === 'csv' || format === 'xlsx') {
            const csvContent = jsonToCSV(dataToExport);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // --- Dynamic Table Headers ---
    const getResultHeaders = () => {
        if (!currentRows.length) return [];
        return Object.keys(currentRows[0]);
    };

    return (
        <div className="pingala-container">
            <div className="pingala-header">
                <h1>Pingala Processor</h1>
                <p>Upload course CSV files to generate the final allocation schedule.</p>
            </div>

            {/* --- UPLOAD SECTION --- */}
            <div className="pingala-card">
                <div className="card-title">1. Upload Source Files</div>
                <div className="upload-controls">
                    <label className="file-input-label">
                        <input 
                            type="file" 
                            multiple 
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <span>📂 Choose CSV Files</span>
                    </label>
                    <button 
                        className="btn-clear-all" 
                        onClick={handleClearAll}
                        disabled={uploadedFiles.length === 0}
                    >
                        Clear All
                    </button>
                    {uploadStatus && <span className="status-text">{uploadStatus}</span>}
                </div>

                {/* File List Chips */}
                <div className="file-list">
                    {uploadedFiles.map(file => (
                        <div key={file.id} className="file-chip">
                            <span className="file-name">{file.fileName}</span>
                            <span className="file-count">({file.rowCount} rows)</span>
                            <button onClick={() => handleRemoveFile(file.id)} className="btn-remove-file">×</button>
                        </div>
                    ))}
                </div>

                {/* Processing Button */}
                <div className="action-area">
                    <button 
                        className="btn-process" 
                        onClick={handleProcess}
                        disabled={uploadedFiles.length === 0 || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Process & Generate Schedule'}
                    </button>
                </div>
            </div>

            {/* --- RESULTS SECTION (Only shows after processing) --- */}
            {processResult && (
                <div className="pingala-card results-card">
                    <div className="card-title">2. Generated Results</div>
                    
                    {/* Toolbar: Toggle & Export */}
                    <div className="results-toolbar">
                        <div className="view-toggle">
                            <button 
                                className={`toggle-btn ${viewMode === 'formatted' ? 'active success' : ''}`}
                                onClick={() => { setViewMode('formatted'); setCurrentPage(1); }}
                            >
                                ✅ Success ({processResult["Formatted courses"]?.length || 0})
                            </button>
                            <button 
                                className={`toggle-btn ${viewMode === 'errored' ? 'active error' : ''}`}
                                onClick={() => { setViewMode('errored'); setCurrentPage(1); }}
                            >
                                ⚠️ Conflicts ({processResult["Errored courses"]?.length || 0})
                            </button>
                        </div>

                        <div className="export-actions">
                            <button className="btn-export csv" onClick={() => handleDownload('csv')}>
                                ⬇ Export CSV
                            </button>
                            <button className="btn-export xlsx" onClick={() => handleDownload('xlsx')}>
                                ⬇ Export Excel (CSV)
                            </button>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="table-wrapper">
                        {currentRows.length > 0 ? (
                            <table className="preview-table results-table">
                                <thead>
                                    <tr>
                                        {getResultHeaders().map(header => (
                                            <th key={header}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.map((row, idx) => (
                                        <tr key={idx}>
                                            {getResultHeaders().map(header => (
                                                <td key={`${idx}-${header}`}>{row[header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                {viewMode === 'formatted' ? "No courses processed." : "Great! No conflicts found."}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalRows > 0 && (
                        <div className="pagination-controls">
                            <span className="page-info">
                                Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, totalRows)} of {totalRows} entries
                            </span>
                            <div className="pagination-buttons">
                                <button 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                
                                {/* Simple Page Number Display */}
                                <span className="current-page-display">Page {currentPage} of {totalPages}</span>

                                <button 
                                    onClick={() => paginate(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- PREVIEW SECTION (Raw Uploads) --- */}
            {!processResult && (
                <div className="pingala-card">
                    <div className="card-title">Raw Data Preview</div>
                    {uploadedFiles.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        {REQUIRED_COLUMNS.map((col) => (
                                            <th key={col}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getMergedData().slice(0, 50).map((row, index) => (
                                        <tr key={index}>
                                            {REQUIRED_COLUMNS.map((col) => (
                                                <td key={`${index}-${col}`}>{row[col] || ''}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {getMergedData().length > 50 && (
                                <div style={{textAlign: 'center', padding: '10px', color: '#999'}}>
                                    ... {getMergedData().length - 50} more rows ...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            Upload files to see a preview of the merged data.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PingalaPage;