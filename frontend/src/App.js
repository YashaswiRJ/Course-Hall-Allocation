// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// // Component Imports
// import LoginPage from './Components/LoginPage';
// import Layout from './Components/Layout';
// import Dashboard from './Components/Dashboard';
// import LectureHallManager from './Components/LectureHallManagar';
// import UploadPage from './Components/UploadPage'; 
// import UploadCentralPage from './Components/UploadCentralPage';
// import GeneratorPage from './Components/GeneratorPage';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(() => {
//     // Check localStorage to maintain session on refresh
//     const saved = localStorage.getItem('isLoggedIn');
//     return saved === 'true';
//   });

//   // Update localStorage whenever the login state changes
//   useEffect(() => {
//     localStorage.setItem('isLoggedIn', isLoggedIn);
//   }, [isLoggedIn]);

//   const handleLogin = () => { setIsLoggedIn(true); };
//   const handleLogout = () => { setIsLoggedIn(false); };

//   return (
//     <BrowserRouter>
//       <div className="App">
//         {isLoggedIn ? (
//           // If logged in, show the main layout with protected routes
//           <Layout onLogout={handleLogout}>
//             <Routes>
//               <Route path="/" element={<Navigate to="/dashboard" />} />
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/generate-schedule" element={<GeneratorPage />} />
//               <Route path="/lecture-halls" element={<LectureHallManager />} />
              
//               {/* Central hub for file uploads */}
//               <Route path="/upload-files" element={<UploadCentralPage />} />

//               {/* Individual file upload pages */}
//               <Route 
//                 path="/upload/course-schedule" 
//                 element={<UploadPage 
//                   title="Course Schedule File"
//                   storageKey="courseScheduleData"
//                   requiredColumns={['Course Code', 'Course Name', 'Instructor', 'Credits', 'Lecture Hours', 'Tutorial Hours', 'Practical Hours']}
//                 />} 
//               />
//               <Route 
//                 path="/upload/constraints" 
//                 element={<UploadPage 
//                   title="Constraint File"
//                   storageKey="constraintData"
//                   requiredColumns={['Constraint Type', 'Details']}
//                 />} 
//               />
//               <Route 
//                 path="/upload/forbidden-halls" 
//                 element={<UploadPage 
//                   title="Forbidden Lecture Hall Constraint"
//                   storageKey="forbiddenHallData"
//                   requiredColumns={['Course Code', 'Forbidden Hall']}
//                 />} 
//               />
//             </Routes>
//           </Layout>
//         ) : (
//           // If not logged in, all paths render the LoginPage
//           <Routes>
//             <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
//           </Routes>
//         )}
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the new provider
import AppRoutes from './routes/AppRoutes'; // Import the new routes component

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
