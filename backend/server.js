// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const XLSX = require('xlsx');

// --- Firebase Admin SDK Setup ---
// This version is simplified for local development.
// Ensure your service account key file is named 'firebase-service-account.json'.
const serviceAccount = require('./firebase-service-account.json');
const { constrainedMemory } = require('process');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// --- End of Firebase Setup ---

const app = express();

// Configure CORS for your local frontend (assuming it runs on port 3000)
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// Use a local 'uploads' directory for file storage.
// IMPORTANT: Make sure you create the 'uploads' folder in your project directory.
const upload = multer({ dest: 'uploads/' });

// --- Lecture Hall API Endpoints for Firebase ---

// GET: Fetch all lecture halls from all building collections
app.get('/api/lecture-halls', async (req, res) => {
    try {
        const buildings = ['LHC', 'TB']; // Add any new building collection names here
        const allHalls = [];
        
        // Use Promise.all to fetch from all building collections concurrently
        await Promise.all(buildings.map(async (buildingName) => {
            const collectionRef = db.collection(buildingName);
            const snapshot = await collectionRef.get();
            snapshot.forEach(doc => {
                allHalls.push({ id: doc.id, building: buildingName, ...doc.data() });
            });
        }));

        // Sort the results for a consistent order
        allHalls.sort((a, b) => {
            if (a.building < b.building) return -1;
            if (a.building > b.building) return 1;
            if (a.name < a.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        res.status(200).json(allHalls);
    } catch (error) {
        console.error('Error fetching lecture halls:', error);
        res.status(500).json({ error: 'Failed to fetch lecture halls' });
    }
});

// POST: Create a new lecture hall in the correct building collection
app.post('/api/lecture-halls', async (req, res) => {
    try {
        const { name, building, capacity, schedule } = req.body;
        if (!name || !building || !capacity || !schedule) {
            return res.status(400).send({ error: 'Missing required fields: name, building, capacity, and schedule are required.' });
        }
        const newHallData = { name, capacity, schedule };
        // Add the new document to the collection specified by the 'building' field
        const docRef = await db.collection(building).add(newHallData);
        res.status(201).json({ id: docRef.id, building: building, ...newHallData });
    } catch (error) {
        console.error('Error creating lecture hall:', error);
        res.status(500).json({ error: 'Failed to create lecture hall' });
    }
});

// PUT: Update an existing lecture hall
app.put('/api/lecture-halls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, building, capacity, schedule } = req.body;
        if (!name || !building || !capacity || !schedule) {
            return res.status(400).send({ error: 'Missing required fields.' });
        }
        
        const hallRef = db.collection(building).doc(id);
        const doc = await hallRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Lecture hall not found in the specified building collection' });
        }

        const updatedData = { name, capacity, schedule };
        await hallRef.update(updatedData);
        res.status(200).json({ id, building, ...updatedData });
    } catch (error) {
        console.error(`Error updating lecture hall ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update lecture hall' });
    }
});

// DELETE: Delete a lecture hall
app.delete('/api/lecture-halls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // The building name is passed as a query parameter, e.g., /api/lecture-halls/some-id?building=LHC
        const { building } = req.query; 

        if (!building) {
            return res.status(400).json({ error: 'Building query parameter is required for deletion.' });
        }

        const hallRef = db.collection(building).doc(id);
        const doc = await hallRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Lecture hall not found' });
        }

        await hallRef.delete();
        res.status(204).send(); // No Content response for successful deletion
    } catch (error) {
        console.error(`Error deleting lecture hall ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete lecture hall' });
    }
});

// Endpoint to run the C++ scheduler binary
app.post('/api/generate-schedule', (req, res) => {
    // 1. Get the course data from the request body
    const courseNHallData = req.body;
    // if (!courseNHallData || !Array.isArray(courseNHallData)) {
    //     return res.status(400).json({ error: 'Invalid or missing course data.' });
    // }

    // 2. Spawn the C++ process (it no longer needs command-line arguments)
    const executablePath = path.join(__dirname, '../cpp_core/build/Debug/Schedule_engine.exe');
    const schedulerProcess = spawn(executablePath);

    console.log('Here we go!');
    // 3. Write the JSON data to the C++ process's standard input
    schedulerProcess.stdin.write(JSON.stringify(req.body));
    schedulerProcess.stdin.end(); // Signal that you're done sending data

    let outputJson = '';
    let errorData = '';

    // 4. Listen for the resulting JSON on standard output
    schedulerProcess.stdout.on('data', (data) => {
        outputJson += data.toString();
    });

    schedulerProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    schedulerProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Scheduler Error: ${errorData}`);
            return res.status(500).json({ error: 'Failed to generate schedule', details: errorData });
        }
        
        try {
            // 5. Parse the JSON output from the C++ program and send it to the client
            const schedule = JSON.parse(outputJson);
            res.status(200).json(schedule);
        } catch (error) {
            console.error('Error parsing schedule output from C++ program:', error);
            res.status(500).json({ error: 'Failed to process schedule output.' });
        }
    });
});


// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});