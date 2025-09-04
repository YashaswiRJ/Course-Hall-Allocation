// seed.js
// This script is for one-time use to populate the Firestore database with initial data.
// It will create a separate collection for each building.

const admin = require('firebase-admin');

// IMPORTANT: This script must be in the same directory as your service account key.
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Data to be added ---

const defaultCapacity = 50;
const defaultSchedule = {
  monday: [{ open: '08:00', close: '17:00' }],
  tuesday: [{ open: '08:00', close: '17:00' }],
  wednesday: [{ open: '08:00', close: '17:00' }],
  thursday: [{ open: '08:00', close: '17:00' }],
  friday: [{ open: '08:00', close: '17:00' }],
};

const buildings = {
    LHC: {
        halls: [],
        collection: db.collection('LHC')
    },
    TB: {
        halls: [],
        collection: db.collection('TB')
    }
};

// Generate LHC halls (L01 to L20)
for (let i = 1; i <= 20; i++) {
    const hallName = `L${i.toString().padStart(2, '0')}`;
    // The 'building' field is no longer needed in the document itself
    buildings.LHC.halls.push({
        name: hallName,
        capacity: defaultCapacity,
        schedule: defaultSchedule
    });
}

// Generate TB halls (TB101 to TB112)
for (let i = 101; i <= 112; i++) {
    const hallName = `TB${i}`;
    buildings.TB.halls.push({
        name: hallName,
        capacity: defaultCapacity,
        schedule: defaultSchedule
    });
}


// --- Function to add the data ---

async function seedDatabase() {
  console.log('Starting to seed the database with separate collections...');

  try {
    let totalHalls = 0;
    // Loop through each building and create a batch write for its halls
    for (const buildingName in buildings) {
      const buildingData = buildings[buildingName];
      const batch = db.batch();

      buildingData.halls.forEach(hall => {
        const docRef = buildingData.collection.doc(); 
        batch.set(docRef, hall);
      });

      await batch.commit();
      totalHalls += buildingData.halls.length;
      console.log(`✅ Successfully added ${buildingData.halls.length} halls to the '${buildingName}' collection.`);
    }
    
    console.log(`\n🎉 Seeding complete. Total halls added: ${totalHalls}.`);

  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  }
}

// Run the function
seedDatabase();

