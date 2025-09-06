const API_BASE_URL = 'http://localhost:5000/api';

// --- Lecture Hall Service Functions ---

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

const deleteLectureHall = async (id, building) => {
    const response = await fetch(`${API_BASE_URL}/lecture-halls/${id}?building=${building}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete lecture hall.');
    }
};

// --- Schedule Generator Function (Updated to send separate priority lists) ---
const generateSchedule = async (courseDataArray, hallDataArray, convenienceFactor, lectureBuildingPriorities, tutorialBuildingPriorities) => {
    const payload = {
        courseData: courseDataArray,
        hallData: hallDataArray,
        convenienceFactor: convenienceFactor,
        lectureBuildingPriorities: lectureBuildingPriorities,
        tutorialBuildingPriorities: tutorialBuildingPriorities
    };

    try {
        const response = await fetch(`${API_BASE_URL}/generate-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

