import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. IMPORT the useAuth hook
import '../Styles/LoginPage.css';

const LoginPage = () => { // 2. REMOVE onLogin from the props
    const { login } = useAuth(); // 3. GET the login function from the context
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
            login(); // 4. CALL the login function from the context
        } else {
            setError('Invalid username or password.');
        }
    };

    // The rest of your component remains the same...
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