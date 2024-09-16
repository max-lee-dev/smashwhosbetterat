import {initializeApp} from "@firebase/app";
import {connectFirestoreEmulator, getFirestore} from "@firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "smashwhosbetterat.firebaseapp.com",
  projectId: "smashwhosbetterat",
  storageBucket: "smashwhosbetterat.appspot.com",
  messagingSenderId: "150569758046",
  appId: "1:150569758046:web:86d62db4bc2a80044073cf",
  measurementId: "G-P61R0TBTZS"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);


// Connect to Firestore emulator if running locally
if (typeof window !== 'undefined' && window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
}