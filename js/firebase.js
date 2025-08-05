
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtytn8L12qf4rqPjqS0Wr6modJ2k1sx9U",
  authDomain: "sanj-healthcare.firebaseapp.com",
  databaseURL: "https://sanj-healthcare-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sanj-healthcare",
  storageBucket: "sanj-healthcare.firebasestorage.app",
  messagingSenderId: "967000066271",
  appId: "1:967000066271:web:768cee54b7bcfc9cd7c16a",
  measurementId: "G-Z677ZX5F5G"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
