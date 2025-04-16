// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAJCpjT0LsSrdfSgBfhnj8j0k3SDcDiZpE",
    authDomain: "todo-d0ebd.firebaseapp.com",
    projectId: "todo-d0ebd",
    storageBucket: "todo-d0ebd.firebasestorage.app",
    messagingSenderId: "71007739346",
    appId: "1:71007739346:web:c9c783686e3543141e7c0b",
    measurementId: "G-NGCBW6679Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
