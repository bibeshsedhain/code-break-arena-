import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Optional for MVP

const firebaseConfig = {
  apiKey: "AIzaSyA-pzBGy6-idoASr-H9LWjtNkumojSuqY8",
  authDomain: "code-break-arena.firebaseapp.com",
  projectId: "code-break-arena",
  storageBucket: "code-break-arena.firebasestorage.app",
  messagingSenderId: "168242423942",
  appId: "1:168242423942:web:211857e654dbef8f898907",
  measurementId: "G-CX0RYWNB7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth so it's accessible across the app
export const auth = getAuth(app);

