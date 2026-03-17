import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbl8ROTu5pIFNgEeqZqi0EKpoCeBQ9GG8",
  authDomain: "venus2026-c5705.firebaseapp.com",
  projectId: "venus2026-c5705",
  storageBucket: "venus2026-c5705.firebasestorage.app",
  messagingSenderId: "110695148807",
  appId: "1:110695148807:web:0a9c39d8e6d3b4e7cae9a2",
  measurementId: "G-XC9L49Q6S6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
