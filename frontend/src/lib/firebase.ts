// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACZaG1JLdj0KdOpwZr0cE5JSCgfct1wNA",
  authDomain: "cloudcraft-ai.firebaseapp.com",
  projectId: "cloudcraft-ai",
  storageBucket: "cloudcraft-ai.firebasestorage.app",
  messagingSenderId: "477903949581",
  appId: "1:477903949581:web:ab969b016a4c01f498ea44",
  measurementId: "G-R069L7GRL1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const analytics = getAnalytics(app);