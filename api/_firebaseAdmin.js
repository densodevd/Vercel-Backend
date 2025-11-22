// api/_firebaseAdmin.js
import admin from "firebase-admin";

if (!global._firebaseAdminInitialized) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
  }
  // Parse the JSON string stored in env var
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // optional: specify storageBucket if you will upload files
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
  });

  global._firebaseAdminInitialized = true;
}

export default admin;
