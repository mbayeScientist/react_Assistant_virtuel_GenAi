// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  aauthDomain: "auth-53bb7.firebaseapp.com",
  projectId: "auth-53bb7",
  storageBucket: "auth-53bb7.firebasestorage.app",
  messagingSenderId: "485652259534",
  appId: "1:485652259534:web:706fa5f053358586a5269f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInAnonymously };