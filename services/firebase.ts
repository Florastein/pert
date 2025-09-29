import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANT: Replace the placeholder values below with your app's Firebase project configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyDu5RqMoV5bnRMrtDNUa70XWm5WE96ns2I",
  authDomain: "square-main.firebaseapp.com",
  projectId: "square-main",
  storageBucket: "square-main.firebasestorage.app",
  messagingSenderId: "945753113380",
  appId: "1:945753113380:web:b41f050a0576f26ee3e9b1",
  measurementId: "G-Y1HXWNN5QZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);