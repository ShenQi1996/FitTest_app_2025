// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHPkztVMKb_Rs79ziIJS7lYFInImwZvN4",
  authDomain: "ptapp2025.firebaseapp.com",
  projectId: "ptapp2025",
  storageBucket: "ptapp2025.firebasestorage.app",
  messagingSenderId: "101603243749",
  appId: "1:101603243749:web:64953114204f4c7d2d460c",
  measurementId: "G-HM8M10QK11",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { app, db };
