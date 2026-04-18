import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbl8ROTu5pIFNgEeqZqi0EKpoCeBQ9GG8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "venus2026-c5705.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "venus2026-c5705",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "venus2026-c5705.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "110695148807",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:110695148807:web:0a9c39d8e6d3b4e7cae9a2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XC9L49Q6S6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
