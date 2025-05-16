// Firebase config for Firestore sync
// 1. Replace the config object with your Firebase project credentials
// 2. This file exports the Firestore instance for use in the app

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY8Ua2YH6zNvx_EN7Y6XwnYY12pU_nG20",
  authDomain: "shift-calendar-b9066.firebaseapp.com",
  projectId: "shift-calendar-b9066",
  storageBucket: "shift-calendar-b9066.appspot.com",
  messagingSenderId: "157646583350",
  appId: "1:157646583350:web:f7bfa36aad2a1aa24f8a97",
  databaseURL: "https://shift-calendar-b9066.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
