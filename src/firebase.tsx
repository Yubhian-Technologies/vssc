// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJT6BbEfajfJNx0cQM14_h00Ha3ntdPmA",
  authDomain: "vssc-c5e04.firebaseapp.com",
  projectId: "vssc-c5e04",
  storageBucket: "vssc-c5e04.firebasestorage.app",
  messagingSenderId: "673792516925",
  appId: "1:673792516925:web:946b5835a1868f0d371b54",
  measurementId: "G-4SJZN109JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
