import React, { useState } from 'react';

// =================================================================
// THIS IS THE LINE YOU NEED TO ADD:
// It tells React to load and apply the styles from Login.css
// to this component.
import '../Styles/LoginPage.css';
// =================================================================

// --- Login Page Component ---
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Hardcoded credentials
    const HARDCODED_USERNAME = 'user';
    const HARDCODED_PASSWORD = 'password123';

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
            setError('');
            onLogin(); // Callback to update the parent component's state
        } else {
            setError('Invalid username or password.');
        }
    };

    // The className attributes now match the CSS selectors in LoginPage.css
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
