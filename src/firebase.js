import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3ID6ZiFEDQBbXI6sD5fLc-_CPQUWAuMY",
  authDomain: "netflix-clone-2c2b6.firebaseapp.com",
  projectId: "netflix-clone-2c2b6",
  storageBucket: "netflix-clone-2c2b6.appspot.com",
  messagingSenderId: "142092227680",
  appId: "1:142092227680:web:063cf4884c1b4cb0cfdf05"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth();

export { auth };
export default db;