const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const port = 5000;

app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Helper function to run C++ engine (no changes here)
function runCppEngine(inputData) {
    // ... same as before
}

// A single, flexible route to handle all generation requests
app.post('/api/generate-schedule', upload.fields([{ name: 'courseFile' }, { name: 'hallFile' }]), async (req, res) => {
    let courseData, hallData;
    const filesToCleanup = [];

    try {
        // --- Determine Course Data ---
        if (req.files && req.files.courseFile) {
            const filePath = req.files.courseFile[0].path;
            filesToCleanup.push(filePath);
            const workbook = XLSX.readFile(filePath);
            courseData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (req.body.courseData) {
            courseData = JSON.parse(req.body.courseData);
        } else {
            throw new Error('Course data is missing.');
        }

        // --- Determine Hall Data ---
        if (req.files && req.files.hallFile) {
            const filePath = req.files.hallFile[0].path;
            filesToCleanup.push(filePath);
            const workbook = XLSX.readFile(filePath);
            hallData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (req.body.hallData) {
            hallData = JSON.parse(req.body.hallData);
        } else {
            throw new Error('Lecture hall data is missing.');
        }

        // --- Call C++ Engine ---
        const inputForCpp = { courseData, lectureHalls: hallData };
        const result = await runCppEngine(inputForCpp);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: 'An error occurred on the server.', details: error.message });
    } finally {
        // Clean up any temporary files that were uploaded
        filesToCleanup.forEach(filePath => fs.unlinkSync(filePath));
    }
});


app.listen(port, () => {
    console.log(`Node.js server listening on http://localhost:${port}`);
});
