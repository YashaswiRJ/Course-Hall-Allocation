const API_BASE_URL = '/api';

/**
 * A flexible function to call the schedule generator.
 * It can handle a mix of File objects and JSON data arrays.
 * @param {File|Array} coursePayload - The course data (File object or array from localStorage).
 * @param {File|Array} hallPayload - The hall data (File object or array from localStorage).
 * @returns {Promise<Object>} - The JSON response from the backend.
 */
const generateSchedule = async (coursePayload, hallPayload) => {
    const formData = new FormData();

    // Check if the payload is a File object or a JSON array
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
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
            throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in generateSchedule API:', error);
        throw error;
    }
};

export {
    generateSchedule,
};
