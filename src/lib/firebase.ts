import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "clickshopclickshop-app.firebaseapp.com",
  projectId: "clickshopclickshop-app",
  storageBucket: "clickshopclickshop-app.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)