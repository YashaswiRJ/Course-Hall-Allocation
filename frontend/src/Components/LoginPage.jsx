// src/Components/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sha256 } from 'js-sha256';
import { useNavigate } from 'react-router-dom';
import '../Styles/LoginPage.css';

// 1. IMPORT THE LOGO
// Make sure this path matches where you saved the logo.
import iitkLogo from '../assets/iitk_logo.png'; 

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const HARDCODED_USERNAME = 'admin';
    const HARDCODED_PASSWORD = 'fee1d8c87aa14849af750fd57e8493065415f3f7c786b9a9f0cdae45757b129b';

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === HARDCODED_USERNAME && sha256(password) === HARDCODED_PASSWORD) {
            setError('');
            login();
            navigate('/dashboard');
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                
                {/* 2. ADD THE LOGO IMAGE */}
                <img src={iitkLogo} alt="IIT Kanpur Logo" className="login-logo" />

                <div className="login-header">
                    <h1>Welcome Back!</h1>
                    <p>Enter your credentials to access your list.</p>
                </div>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="who_are_you?"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="verify_identity()"
                        />
                    </div>
                    
                    <p className="error-message">{error || ' '}</p>

                    <button type="submit" className="submit-button">
                        Sign In
                    </button>
                </form>

                <p className="login-hint">
                    {/* 3. Minor typo fix */}
                    Be mindful of your password security. 
                </p>
            </div>
        </div>
    );
};

export default LoginPage;