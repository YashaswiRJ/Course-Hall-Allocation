import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the custom auth hook

// Component Imports
import LoginPage from '../Components/LoginPage';
import Layout from '../Components/Layout';
import Dashboard from '../Components/Dashboard';
import LectureHallManager from '../Components/LectureHallManagar';
import UploadPage from '../Components/UploadPage';
import UploadCentralPage from '../Components/UploadCentralPage';
import GeneratorPage from '../Components/GeneratorPage';
import StatsViewer from '../Components/StatsViewer';
import TimelineViewer from '../Components/TimelineViewer';
// --- 1. IMPORT THE NEW RESULTS PAGE ---
import ResultsPage from '../Components/ResultsPage'; // Assuming ResultsPage.jsx is in the same folder


const AppRoutes = () => {
    const { isLoggedIn } = useAuth();

    return (
        <>
            {isLoggedIn ? (
                // If logged in, show the main layout with protected routes
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/generate-schedule" element={<GeneratorPage />} />
                        <Route path="/lecture-halls" element={<LectureHallManager />} />
                        <Route path="/upload-files" element={<UploadCentralPage />} />
                        <Route
                            path="/upload/course-schedule"
                            element={<UploadPage
                                title="Course Schedule File"
                                storageKey="courseScheduleData"
                                requiredColumns={[
                                    'Course Name/Group Name', 'Slot Name', 'Units(Credits)', 'Course Type',
                                    'Instructor', 'Instructor Email', 'Lecture Schedule', 'Tutorial Schedule',
                                    'Tutorial Group', 'Practical Schedule', 'Registered Student'
                                ]}
                            />}
                        />
                        <Route
                            path="/upload/constraints"
                            element={<UploadPage
                                title="Constraint File"
                                storageKey="constraintData"
                                requiredColumns={['Constraint Type', 'Details']}
                            />}
                        />
                        <Route
                            path="/upload/forbidden-halls"
                            element={<UploadPage
                                title="Forbidden Lecture Hall Constraint"
                                storageKey="forbiddenHallData"
                                requiredColumns={['Course Code', 'Forbidden Hall']}
                            />}
                        />
                        <Route path="/schedule-viewer" element={<StatsViewer />} />
                        <Route path="/timeline-viewer" element={<TimelineViewer />} />
                        
                        {/* --- 2. ADD THE NEW ROUTE HERE --- */}
                        <Route path="/results" element={<ResultsPage />} />

                    </Routes>
                </Layout>
            ) : (
                // If not logged in, all paths render the LoginPage
                <Routes>
                    <Route path="*" element={<LoginPage />} />
                </Routes>
            )}
        </>
    );
};

export default AppRoutes;