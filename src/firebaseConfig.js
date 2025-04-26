// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGwPGAoYPT4NnBWaswY43tmp1dyHvMltM",
  authDomain: "edutech4space-d0bbd.firebaseapp.com",
  databaseURL: "https://edutech4space-d0bbd-default-rtdb.firebaseio.com",
  projectId: "edutech4space-d0bbd",
  storageBucket: "edutech4space-d0bbd.firebasestorage.app",
  messagingSenderId: "961358362257",
  appId: "1:961358362257:web:0f5ccbebcddc0321887130",
  measurementId: "G-YS3DRTCHC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db }; 