// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC5XtdG972gq82NgS0kupue46NnhlJj4r8',
  authDomain: 'runtimechat-c17d7.firebaseapp.com',
  databaseURL: 'https://runtimechat-c17d7-default-rtdb.firebaseio.com',
  projectId: 'runtimechat-c17d7',
  storageBucket: 'runtimechat-c17d7.appspot.com',
  messagingSenderId: '370928303106',
  appId: '1:370928303106:web:9b0c7c286aad5f96587b1b',
  measurementId: 'G-TKLZ1RM0M1',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { db, auth, provider, analytics }
