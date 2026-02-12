import {
  type FirebaseApp,
  type FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const requiredEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function ensureFirebaseConfig(): FirebaseOptions {
  const missing = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message = `Faltan variables de entorno de Firebase: ${missing.join(
      ", ",
    )}`;

    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }

  return {
    apiKey: requiredEnv.apiKey ?? "",
    authDomain: requiredEnv.authDomain ?? "",
    projectId: requiredEnv.projectId ?? "",
    storageBucket: requiredEnv.storageBucket ?? "",
    messagingSenderId: requiredEnv.messagingSenderId ?? "",
    appId: requiredEnv.appId ?? "",
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!getApps().length) {
    const config = ensureFirebaseConfig();
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApp();
  }

  return firebaseApp;
}

export function getFirestoreDb(): Firestore {
  if (firestore) {
    return firestore;
  }

  firestore = getFirestore(getFirebaseApp());
  return firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (storage) return storage;
  storage = getStorage(getFirebaseApp());
  return storage;
}

export const firebaseClient = {
  getApp: getFirebaseApp,
  getFirestore: getFirestoreDb,
  getStorage: getFirebaseStorage,
};

