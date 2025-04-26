// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion , getDoc , doc } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

export { auth, signInWithEmailAndPassword, signInWithGoogle, db, collection, query, where, getDocs, addDoc, updateDoc , arrayUnion , getDoc , doc };



