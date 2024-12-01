import { applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK only if no app is initialized
if (!getApps().length) {
  admin.initializeApp({
    credential: applicationDefault(), // Uses default credentials from environment
  });
}

export const db = getFirestore();
