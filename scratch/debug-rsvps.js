const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");
const fs = require("fs");

// Read config from next.config.ts or just harcode it for this script
// Since next.config.ts is TS, I'll extract the config manually or use the client config file
// Let's assume standard env vars are not set in this shell, so I'll try to read a file or just use the ones I see in lib/firebase.ts if I can read it.

// WAIT, I can just use the EXISTING lib/firebase.ts if I run with ts-node or similar.
// Simpler: I will create a script that uses the known config variables.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// I need the actual values. I will peek at .env.local if it exists or ask the user.
// Attempting to read .env.local first.

try {
    const envFile = fs.readFileSync(".env.local", "utf8");
    envFile.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log("No .env.local found");
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

async function checkPending() {
    console.log("Checking pending RSVPs...");
    try {
        const q = query(collection(db, "rsvps")); // Get all and filter in JS to be sure
        const snapshot = await getDocs(q);
        let pendingCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            // Replicate the logic from useRsvpData
            const statusValue = typeof data.status === "string" ? data.status.toLowerCase() : "";
            const status = statusValue === "contactado" ? "contactado" : statusValue === "confirmado" ? "confirmado" : "pendiente";
            
            if (status === "pendiente") {
                console.log(`- ID: ${doc.id}, Name: ${data.fullName}, Status (Raw): ${data.status}, Email: ${data.email}`);
                pendingCount++;
            }
        });
        console.log(`Total Pending: ${pendingCount}`);
    } catch (error) {
        console.error("Error fetching documents:", error);
    }
}

checkPending();
