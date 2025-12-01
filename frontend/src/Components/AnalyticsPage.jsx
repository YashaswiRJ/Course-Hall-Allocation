import React, { useState } from 'react';
import '../Styles/AnalyticsPage.css';
import { 
  Flame, 
  BrainCircuit, 
  TrendingUp, 
  Upload, 
  Database,
  LineChart 
} from 'lucide-react';

const AnalyticsPage = () => {
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    }
  };

  return (
    <div className="analytics-page-container">
      {/* Header Section */}
      <header className="analytics-header">
        <h1>The Analytics Part</h1>
        <p>Future-Proof Your Infrastructure with Machine Learning</p>
      </header>

      <div className="analytics-poster">
        
        {/* Concept Section */}
        <div className="fire-card">
          <div className="poster-title">
            <BrainCircuit size={40} className="poster-icon" />
            <h2>Predictive Modeling Engine</h2>
          </div>
          
          <div className="poster-content">
            <p>
              Welcome to the advanced analytics module. This system utilizes historical enrollment data
              and regression models to predict future branch strengths. By analyzing trends over past
              academic years, we ensure that lecture hall capacities are optimized before the semester begins.
            </p>
            
            <div className="features-grid">
              <div className="feature-item">
                <TrendingUp size={32} color="#ffab91" />
                <h3>Trend Analysis</h3>
                <p>Identify growth patterns in specific engineering branches.</p>
              </div>
              <div className="feature-item">
                <Database size={32} color="#ffab91" />
                <h3>Capacity Planning</h3>
                <p>Automated alerts for halls nearing maximum capacity.</p>
              </div>
              <div className="feature-item">
                <LineChart size={32} color="#ffab91" />
                <h3>Projection</h3>
                <p>AI-driven forecasts for next year's batch sizes.</p>
              </div>
            </div>

            <div className="highlight-text">
              <Flame size={20} style={{display: 'inline', marginRight: '10px'}} />
              This section will be used for handling the behaviour of lecture hall capacities, 
              when the branch strength has to be increased based on the past year data and projection techniques.
            </div>
          </div>
        </div>

        {/* Input Data Section */}
        <div className="fire-card upload-section">
          <div className="poster-title">
            <Upload size={40} className="poster-icon" />
            <h2>Input Historical Data</h2>
          </div>
          
          <label htmlFor="analytics-file-upload" className="fire-upload-box">
            <div className="upload-icon-wrapper">
              <Upload size={40} color="#fff" />
            </div>
            <div className="upload-text">
              <h3>Upload Dataset (.csv / .json)</h3>
              <p>Drag and drop your past year branch strength data here</p>
              <p style={{marginTop: '10px', fontWeight: 'bold', color: '#ffccbc'}}>
                Selected File: {fileName}
              </p>
            </div>
            <input 
              id="analytics-file-upload" 
              type="file" 
              className="hidden-input" 
              accept=".csv,.json,.xlsx"
              onChange={handleFileChange}
            />
          </label>

          <button className="btn-analyze">
            Initialize Projection Model
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;