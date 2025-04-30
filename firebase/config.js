import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_Nuw1MOkNnvJlKtwpbebqV2U-Au2vnW4",
  authDomain: "event-app-91310.firebaseapp.com",
  projectId: "event-app-91310",
  storageBucket: "event-app-91310.firebasestorage.app",
  messagingSenderId: "1025959339738",
  appId: "1:1025959339738:web:f2aafcfc3ed0cd6542a7e3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 