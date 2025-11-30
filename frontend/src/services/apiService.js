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

const createBuilding = async (buildingData) => {
    // Expects an object like { name: 'BuildingName', initialHall: { ... } }
    const response = await fetch(`${API_BASE_URL}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildingData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create building.');
    }
    return response.json();
};

const deleteBuilding = async (buildingName) => {
    const response = await fetch(`${API_BASE_URL}/buildings/${encodeURIComponent(buildingName)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete building.');
    }
};

// --- Schedule Generator Function (Updated to send separate priority lists) ---
const generateSchedule = async (courseDataArray, hallDataArray, convenienceFactor, lectureBuildingPriorities, tutorialBuildingPriorities, preallocatedConstraints) => {
    const payload = {
        courseData: courseDataArray,
        hallData: hallDataArray,
        convenienceFactor: convenienceFactor,
        lectureBuildingPriorities: lectureBuildingPriorities,
        tutorialBuildingPriorities: tutorialBuildingPriorities,
        preallocatedConstraints: preallocatedConstraints
    };

    try {
        const response = await fetch(`${API_BASE_URL}/generate-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Yeh bhi dekh lete hain', response);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.details || errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const finalData = await response.json();
        console.log('Final JSON data from server:', finalData); // This will show your schedule object
        return finalData;
        // console.log('Response here', typeof response, response);
        // return await response.json();
    } catch (error) {
        console.error('Error in generateSchedule API:', error);
        throw error;
    }
};

const processPingalaData = async (mergedData) => {
    try {
        console.log('Sending merged data to backend:', mergedData);
        const response = await fetch(`${API_BASE_URL}/process-pingala`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mergedData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred hua.' }));
            throw new Error(errorData.details || errorData.error || `HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in processPingalaData API:', error);
        throw error;
    }
};

export {
    getLectureHalls,
    createLectureHall,
    updateLectureHall,
    deleteLectureHall,
    createBuilding,   
    deleteBuilding,
    generateSchedule,
    processPingalaData
};

