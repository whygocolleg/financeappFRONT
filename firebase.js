import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqYgRjhjKR112gjatPC3vXx7Ri45zqGdE",
    authDomain: "financeapp-2b9fe.firebaseapp.com",
    projectId: "financeapp-2b9fe",
    storageBucket: "financeapp-2b9fe.firebasestorage.app",
    messagingSenderId: "23415355349",
    appId: "1:23415355349:web:deca3738ebf85dab486f5c",
    measurementId: "G-T30ME5BWF5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
