import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCt8IGGAS_aww7lSHYnX2s8Yap-QbGuOM0",
  authDomain: "questify-9dcf7.firebaseapp.com",
  projectId: "questify-9dcf7",
  storageBucket: "questify-9dcf7.firebasestorage.app",
  messagingSenderId: "391918980779",
  appId: "1:391918980779:web:2cd8ea63cfd22e42d571ee",
  measurementId: "G-47WQPB2LSD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
