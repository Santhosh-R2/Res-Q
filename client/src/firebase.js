// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJoOAyZWiyumncMhhJuQiB3FCXkB35dXY",
  authDomain: "res-q-54802.firebaseapp.com",
  projectId: "res-q-54802",
  storageBucket: "res-q-54802.firebasestorage.app",
  messagingSenderId: "751750587454",
  appId: "1:751750587454:web:460ba44318d15d96e21d6f",
  measurementId: "G-FKPTNX8FMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();