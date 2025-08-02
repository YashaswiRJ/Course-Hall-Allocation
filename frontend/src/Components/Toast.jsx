import React, { useEffect } from 'react';
import '../Styles/Toast.css';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        // Set a timer to automatically close the toast after 1 second
        const timer = setTimeout(() => {
            onClose();
        }, 1000); // 1000 milliseconds = 1 second

        // Cleanup the timer if the component is unmounted
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    );
};

export default Toast;
