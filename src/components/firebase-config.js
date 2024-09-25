// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZ_nCJWZBXGG064rhg-DkOYyoe1OsPDws",
  authDomain: "petalo9.firebaseapp.com",
  projectId: "petalo9",
  storageBucket: "petalo9.appspot.com",
  messagingSenderId: "494354395398",
  appId: "494354395398:web:4492063e3e347f541d2e87"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

