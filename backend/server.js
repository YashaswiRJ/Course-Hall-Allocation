// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const XLSX = require('xlsx');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// --- Supabase Setup ---
// Initialize the Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// --- Lecture Hall API Endpoints ---

// GET: Fetch all lecture halls and their schedules
app.get('/api/lecture-halls', async (req, res) => {
    try {
        // 1. Fetch all halls
        const { data: halls, error: hallsError } = await supabase
            .from('lecture_halls')
            .select('*')
            .order('id');
        if (hallsError) throw hallsError;

        // 2. Fetch all available slots
        const { data: slots, error: slotsError } = await supabase
            .from('available_slots')
            .select('*');
        if (slotsError) throw slotsError;

        const dayMapping = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        // 3. Combine the data into the structure the frontend expects
        const responseData = halls.map(hall => {
            const hallSlots = slots.filter(s => s.hall_id === hall.id);
            const schedule = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
            
            hallSlots.forEach(slot => {
                const day = dayMapping[slot.day_of_week - 1];
                if (day) {
                    schedule[day].push({
                        open: slot.start_time.slice(0, 5), // Format to HH:mm
                        close: slot.end_time.slice(0, 5)   // Format to HH:mm
                    });
                }
            });
            return { ...hall, schedule };
        });

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching lecture halls:', error.message);
        res.status(500).json({ error: 'Failed to fetch lecture halls', details: error.message });
    }
});

// POST: Create a new lecture hall
app.post('/api/lecture-halls', async (req, res) => {
    const { name, capacity, schedule } = req.body;
    try {
        // 1. Insert the main hall details
        const { data: newHall, error: hallError } = await supabase
            .from('lecture_halls')
            .insert({ name, capacity })
            .select()
            .single(); // .single() returns the created object
        if (hallError) throw hallError;

        // 2. Prepare the schedule slots for insertion
        const dayMapping = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
        const slotsToInsert = [];
        for (const day in schedule) {
            const dayOfWeek = dayMapping[day];
            schedule[day].forEach(slot => {
                slotsToInsert.push({
                    hall_id: newHall.id,
                    day_of_week: dayOfWeek,
                    start_time: slot.open,
                    end_time: slot.close
                });
            });
        }

        // 3. Insert all slots
        if (slotsToInsert.length > 0) {
            const { error: slotsError } = await supabase.from('available_slots').insert(slotsToInsert);
            if (slotsError) throw slotsError;
        }

        res.status(201).json(newHall);
    } catch (error) {
        console.error('Error creating lecture hall:', error.message);
        res.status(500).json({ error: 'Failed to create lecture hall', details: error.message });
    }
});

// PUT: Update an existing lecture hall
app.put('/api/lecture-halls/:id', async (req, res) => {
    const { id } = req.params;
    const { name, capacity, schedule } = req.body;
    try {
        // 1. Update the main hall details
        const { data: updatedHall, error: hallError } = await supabase
            .from('lecture_halls')
            .update({ name, capacity })
            .eq('id', id)
            .select()
            .single();
        if (hallError) throw hallError;

        // 2. Delete all old slots for this hall to ensure a clean update
        const { error: deleteError } = await supabase.from('available_slots').delete().eq('hall_id', id);
        if (deleteError) throw deleteError;

        // 3. Insert the new schedule slots (same logic as POST)
        const dayMapping = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
        const slotsToInsert = [];
        for (const day in schedule) {
            const dayOfWeek = dayMapping[day];
            schedule[day].forEach(slot => {
                slotsToInsert.push({
                    hall_id: updatedHall.id,
                    day_of_week: dayOfWeek,
                    start_time: slot.open,
                    end_time: slot.close
                });
            });
        }
        if (slotsToInsert.length > 0) {
            const { error: slotsError } = await supabase.from('available_slots').insert(slotsToInsert);
            if (slotsError) throw slotsError;
        }

        res.json(updatedHall);
    } catch (error) {
        console.error(`Error updating lecture hall ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to update lecture hall', details: error.message });
    }
});

// DELETE: Delete a lecture hall
// Note: Because of "ON DELETE CASCADE" in our SQL, deleting a hall will auto-delete its slots.
app.delete('/api/lecture-halls/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('lecture_halls')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error(`Error deleting lecture hall ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to delete lecture hall', details: error.message });
    }
});


// --- The existing generate-schedule route remains unchanged ---
// Helper function to run the C++ engine...
function runCppEngine(inputData) {
    return new Promise((resolve, reject) => {
        const executableName = process.platform === 'win32' ? 'schedule_engine.exe' : 'schedule_engine';
        const cppExecutable = path.join(__dirname, '..', 'cpp_core', executableName);
        if (!fs.existsSync(cppExecutable)) {
            return reject(new Error(`Executable not found at path: ${cppExecutable}`));
        }
        const cppProcess = spawn(cppExecutable);
        cppProcess.on('error', (err) => { reject(err); });
        let responseData = '';
        let errorData = '';
        cppProcess.stdout.on('data', (data) => { responseData += data.toString(); });
        cppProcess.stderr.on('data', (data) => { errorData += data.toString(); });
        cppProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`C++ process exited with code ${code}: ${errorData}`));
            }
            try {
                if (!responseData) {
                    return reject(new Error('C++ process finished without producing any output.'));
                }
                resolve(JSON.parse(responseData));
            } catch (e) {
                reject(new Error(`Failed to parse C++ output as JSON. Raw output: ${responseData}`));
            }
        });
        cppProcess.stdin.write(JSON.stringify(inputData));
        cppProcess.stdin.end();
    });
}
app.post('/api/generate-schedule', upload.fields([{ name: 'courseFile' }, { name: 'hallFile' }]), async (req, res) => {
    let courseData, hallData;
    const filesToCleanup = [];
    try {
        if (req.files && req.files.courseFile) {
            const filePath = req.files.courseFile[0].path;
            filesToCleanup.push(filePath);
            const workbook = XLSX.readFile(filePath);
            courseData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (req.body.courseData) {
            courseData = JSON.parse(req.body.courseData);
        } else {
            throw new Error('Course data is missing from the request.');
        }
        if (req.files && req.files.hallFile) {
            const filePath = req.files.hallFile[0].path;
            filesToCleanup.push(filePath);
            const workbook = XLSX.readFile(filePath);
            hallData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (req.body.hallData) {
            hallData = JSON.parse(req.body.hallData);
        } else {
            throw new Error('Lecture hall data is missing from the request.');
        }
        const inputForCpp = { courseData, lectureHalls: hallData };
        const result = await runCppEngine(inputForCpp);
        res.json(result);
    } catch (error) {
        console.error('Error in /api/generate-schedule:', error.message);
        res.status(500).json({ error: 'An error occurred on the server.', details: error.message });
    } finally {
        filesToCleanup.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Node.js server listening on http://localhost:${port}`);
});