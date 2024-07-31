// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhuiL9Za69fy6F2UUtloG_RFBig6Q2etw",
  authDomain: "pantryapp-3bda7.firebaseapp.com",
  projectId: "pantryapp-3bda7",
  storageBucket: "pantryapp-3bda7.appspot.com",
  messagingSenderId: "87718309500",
  appId: "1:87718309500:web:42a476a417234d6fd423f9",
  measurementId: "G-KVXLCZ1JJG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };
const analytics = getAnalytics(app);
