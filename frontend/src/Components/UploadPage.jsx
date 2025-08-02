import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Toast from './Toast'; // Import the Toast component
import '../Styles/UploadCsv.css';

const UploadPage = ({ title, requiredColumns, storageKey }) => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) { setData([]); }
    } else {
      setData([]);
    }
    setFileName('');
    setSearchTerm('');
    setCurrentPage(1);
  }, [storageKey]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (jsonData.length < 1) {
          setToast({ show: true, message: 'File is empty or invalid.', type: 'error' });
          return;
        }
        const header = jsonData[0];
        const requiredIndices = requiredColumns.map(col => header.indexOf(col)).filter(index => index !== -1);
        if(requiredIndices.length !== requiredColumns.length) {
            const missing = requiredColumns.filter(col => !header.includes(col));
            setToast({ show: true, message: `Missing columns: ${missing.join(', ')}`, type: 'error' });
            return;
        }
        const processedData = jsonData.slice(1).map(row => {
          const newRow = {};
          requiredIndices.forEach((index, i) => {
            newRow[requiredColumns[i]] = row[index] || '';
          });
          return newRow;
        });
        setData(processedData);
      } catch (error) {
        setToast({ show: true, message: 'Error processing file.', type: 'error' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setToast({ show: true, message: `${title} data saved!`, type: 'success' });
  };
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  return (
    <div className="upload-page-container">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: '' })} />}
      <header className="main-header">
        <h1>{title}</h1>
        <p>Upload and manage data for this section.</p>
      </header>
      <div className="upload-section-card">
        <div className="file-input-wrapper">
          <input type="file" id={`file-upload-${storageKey}`} onChange={handleFileUpload} accept=".xlsx, .csv" />
          <label htmlFor={`file-upload-${storageKey}`} className="file-input-label">
            {fileName || 'Click to Upload Excel File'}
          </label>
          <button onClick={handleSave} className="btn-save-storage" disabled={!data.length}>Save to Local Storage</button>
        </div>
        
        {data.length > 0 && (
          <div className="data-display-section">
            <div className="data-controls">
              <input 
                type="text" 
                placeholder="Search in this table..." 
                className="table-search-input"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
               <label className="pagination-select">
                Show:
                <select value={entriesPerPage} onChange={(e) => {setEntriesPerPage(Number(e.target.value)); setCurrentPage(1);}}>
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
                    {requiredColumns.map(col => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index}>
                      {requiredColumns.map(col => <td key={col}>{row[col]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
