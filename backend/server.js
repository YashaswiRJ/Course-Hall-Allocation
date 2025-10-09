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
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// --- End of Firebase Setup ---

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// --- Helper Function to Delete a Collection ---
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve();
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}


// --- Building API Endpoints ---

// POST: Create a new building (collection) with its first lecture hall
app.post('/api/buildings', async (req, res) => {
    try {
        const { name, initialHall } = req.body;

        if (!name || !initialHall || !initialHall.name || !initialHall.capacity) {
            return res.status(400).json({ error: 'Building name and details for the initial hall are required.' });
        }
        
        // Firestore automatically creates the collection when the first document is added.
        const docRef = await db.collection(name).add(initialHall);
        
        res.status(201).json({ 
            message: `Building '${name}' created successfully with initial hall.`,
            buildingName: name,
            hallId: docRef.id 
        });
    } catch (error) {
        console.error('Error creating building:', error);
        res.status(500).json({ error: 'Failed to create building.' });
    }
});

// DELETE: Delete a building and all halls within it
app.delete('/api/buildings/:buildingName', async (req, res) => {
    try {
        const { buildingName } = req.params;
        if (!buildingName) {
            return res.status(400).json({ error: 'Building name is required.' });
        }

        // Use the helper function to delete all documents in the collection
        await deleteCollection(db, buildingName, 50);

        res.status(204).send(); // Success, no content
    } catch (error) {
        console.error(`Error deleting building ${req.params.buildingName}:`, error);
        res.status(500).json({ error: 'Failed to delete building.' });
    }
});


// --- Lecture Hall API Endpoints for Firebase ---

// GET: Fetch all lecture halls from all building collections
app.get('/api/lecture-halls', async (req, res) => {
    try {
        // Dynamically get all collections (buildings)
        const collections = await db.listCollections();
        const buildingNames = collections.map(col => col.id);

        const allHalls = [];
        
        await Promise.all(buildingNames.map(async (buildingName) => {
            const collectionRef = db.collection(buildingName);
            const snapshot = await collectionRef.get();
            snapshot.forEach(doc => {
                allHalls.push({ id: doc.id, building: buildingName, ...doc.data() });
            });
        }));

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
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting lecture hall ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete lecture hall' });
    }
});

// Endpoint to run the C++ scheduler binary
app.post('/api/generate-schedule', (req, res) => {
    const courseNHallData = req.body;

    const executablePath = path.join(__dirname, '../cpp_core/build/schedule_engine');
    const schedulerProcess = spawn(executablePath);

    schedulerProcess.stdin.write(JSON.stringify(req.body));
    schedulerProcess.stdin.end();

    let outputJson = '';
    let errorData = '';

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