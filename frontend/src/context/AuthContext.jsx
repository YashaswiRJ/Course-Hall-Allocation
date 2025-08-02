import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// This component will wrap our app and provide authentication state
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Initialize state from localStorage
        const saved = localStorage.getItem('isLoggedIn');
        return saved === 'true';
    });

    // Update localStorage whenever the login state changes
    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
    }, [isLoggedIn]);

    // Functions to be called by components
    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    // The value provided to consuming components
    const value = { isLoggedIn, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// A custom hook to easily use the authentication context
export const useAuth = () => {
    return useContext(AuthContext);
};
