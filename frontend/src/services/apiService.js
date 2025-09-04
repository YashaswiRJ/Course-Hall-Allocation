// src/services/apiService.js

// IMPORTANT: The base URL is now relative. Vercel will handle the routing.
const API_BASE_URL = '/api';

// --- Lecture Hall Service Functions (Updated for Firebase Backend) ---

const getLectureHalls = async () => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch lecture halls.');
    }
    return response.json();
};

const createLectureHall = async (hallData) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hallData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create lecture hall.');
    }
    return response.json();
};

const updateLectureHall = async (id, hallData) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hallData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update lecture hall.');
    }
    return response.json();
};

// MODIFIED: Now requires the building name to construct the correct request
const deleteLectureHall = async (id, building) => {
    // The building is sent as a query parameter as required by the server
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}?building=${building}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete lecture hall.');
    }
    // DELETE requests often return no content
};


// --- Schedule Generator Function (Updated for Firebase Backend) ---
// This function no longer needs hall data, as the server gets it from Firebase.
const generateSchedule = async (courseFile) => {
    const formData = new FormData();
    formData.append('courseFile', courseFile);

    try {
        const response = await fetch(`${API_BASE_URL}/generate-schedule`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.details || errorData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in generateSchedule API:', error);
        throw error;
    }
};

export {
    getLectureHalls,
    createLectureHall,
    updateLectureHall,
    deleteLectureHall,
    generateSchedule,
};