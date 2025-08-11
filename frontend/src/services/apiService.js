// apiService.js

const API_BASE_URL = 'http://localhost:5000/api';

// --- Lecture Hall Service Functions ---

const getLectureHalls = async () => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`);
    if (!response.ok) {
        throw new Error('Failed to fetch lecture halls.');
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
        throw new Error('Failed to create lecture hall.');
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
        throw new Error('Failed to update lecture hall.');
    }
    return response.json();
};

const deleteLectureHall = async (id) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete lecture hall.');
    }
    // DELETE requests often return no content, so we don't return response.json()
};


// --- Existing Schedule Generator Function ---
const generateSchedule = async (coursePayload, hallPayload) => {
    const formData = new FormData();
    if (coursePayload instanceof File) {
        formData.append('courseFile', coursePayload);
    } else {
        formData.append('courseData', JSON.stringify(coursePayload));
    }
    if (hallPayload instanceof File) {
        formData.append('hallFile', hallPayload);
    } else {
        formData.append('hallData', JSON.stringify(hallPayload));
    }
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
    // New exports
    getLectureHalls,
    createLectureHall,
    updateLectureHall,
    deleteLectureHall,
    // Existing export
    generateSchedule,
};