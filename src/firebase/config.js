import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBW3O7q8SheOWRzMHZxY3cFzjeOk44HpmY",
  authDomain: "arogyam-a2612.firebaseapp.com",
  projectId: "arogyam-a2612",
  storageBucket: "arogyam-a2612.firebasestorage.app",
  messagingSenderId: "297605959236",
  appId: "1:297605959236:web:4e70da01bca6f94436b611"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
