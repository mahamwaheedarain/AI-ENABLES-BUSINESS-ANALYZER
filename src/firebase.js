// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ❌ removed GoogleAuthProvider
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6SoeK5HBiXfL0ndsj4WqJDWQkKbaEcho",
  authDomain: "insightiqweb.firebaseapp.com",
  projectId: "insightiqweb",
  storageBucket: "insightiqweb.appspot.com",
  messagingSenderId: "84689770907",
  appId: "1:84689770907:web:ddfa3f3d30a41f0ab1e93e",
  measurementId: "G-2D3NSM4JQF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

