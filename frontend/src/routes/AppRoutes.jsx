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
import ResultsPage from '../Components/ResultsPage';
import PingalaPage from '../Components/PingalaPage';

/**
 * A wrapper component that protects routes.
 * If the user is logged in, it renders the main <Layout> (with sidebar)
 * and the requested page.
 * If not, it redirects them to the /login page.
 */
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        // Redirect to login, replacing the current history entry
        return <Navigate to="/login" replace />;
    }
    // If logged in, render the Layout and the protected page
    return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    const { isLoggedIn } = useAuth();

    return (
        <Routes>
            {/* PUBLIC ROUTE: /login
              - If user is not logged in, show LoginPage.
              - If user *is* logged in and tries to visit /login, redirect them
                to the dashboard.
            */}
            <Route 
                path="/login" 
                element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
            />

            {/* PROTECTED ROUTES:
              All other routes are wrapped by our <ProtectedRoute> component.
            */}
            <Route
                path="/*" // This captures all other paths
                element={
                    <ProtectedRoute>
                        <Routes>
                            {/* Dashboard is the default protected route */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            {/* Other App Routes */}
                            <Route path="/generate-schedule" element={<GeneratorPage />} />
                            <Route path="/lecture-halls" element={<LectureHallManager />} />
                            <Route path="/upload-files" element={<UploadCentralPage />} />
                            <Route
                                path="/upload/course-schedule"
                                element={<UploadPage
                                    title="Course Schedule File"
                                    storageKey="courseScheduleData"
                                    requiredColumns={[
                                        'Course Name', 'Course Code', 'Sections', 'Modular Course',
                                        'Modular Binding', 'Lecture Schedule', 'Tutorial Schedule',
                                        'Tutorial Count', 'Students Registered'
                                    ]}
                                />}
                            />
                            <Route
                                path="/upload/constraints"
                                element={<UploadPage
                                    title="Pre-allocated Constraint File"
                                    storageKey="preallocatedData"
                                    requiredColumns={[
                                        'Course Name', 'Course Code', 'Section', 
                                        'Lecture Hall Allocated', 'Type', 'Schedule', 'Modular Course', 'Students Registered'
                                    ]}
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
                            <Route path="/results" element={<ResultsPage />} />
                            <Route path="/pingala" element={<PingalaPage />} />

                            {/* Default route for logged-in users */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            
                            {/* Fallback for any other unknown protected path */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;