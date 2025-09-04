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
// This is the critical change for Vercel deployment
let serviceAccount;

// Check if the environment variable is available (for Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', e);
        process.exit(1);
    }
} else {
    // Fallback to the local file for local development
    try {
        serviceAccount = require('./firebase-service-account.json.json');
    } catch (e) {
        console.error('Could not find or parse local service account file. Make sure firebase-service-account.json.json exists for local development.');
        process.exit(1);
    }
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// --- End of Firebase Setup ---

const app = express();

// Configure CORS for your Vercel frontend URL
const frontendURL = process.env.VERCEL_URL || 'http://localhost:3000';
app.use(cors({ origin: `https://${frontendURL}` }));

app.use(express.json());
const upload = multer({ dest: '/tmp' }); // Use /tmp for Vercel's writable directory

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
            if (a.name < b.name) return -1;
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


// This part is problematic for Vercel's serverless environment.
// C++ binary execution is not directly supported in the default Node.js runtime.
// This endpoint will likely fail on Vercel unless you use a custom Docker runtime.
// For now, we will leave it but be aware it may not work.
app.post('/api/generate-schedule', upload.single('courseFile'), async (req, res) => {
    res.status(501).json({ error: 'C++ engine execution is not supported in this Vercel environment.' });
});


// Export the app for Vercel
module.exports = app;
