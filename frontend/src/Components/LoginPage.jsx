// src/Components/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT the useNavigate hook
import '../Styles/LoginPage.css';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate(); // 2. INITIALIZE the navigate function
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const HARDCODED_USERNAME = 'user';
    const HARDCODED_PASSWORD = 'password123';

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
            setError('');
            login();
            navigate('/dashboard'); // 3. REDIRECT to the dashboard on success
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
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
                            placeholder="user"
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
                            placeholder="password123"
                        />
                    </div>
                    
                    <p className="error-message">{error || ' '}</p>

                    <button type="submit" className="submit-button">
                        Sign In
                    </button>
                </form>

                <p className="login-hint">
                    Hint: Use 'user' and 'password123' to login.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;