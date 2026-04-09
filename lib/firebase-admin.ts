import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e);
      }
    }
    
    // Fallback if no service account key is provided (works if running in GCP/Firebase environment)
    return initializeApp();
  }
  return getApps()[0];
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
