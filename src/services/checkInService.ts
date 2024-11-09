// src/services/checkInService.ts
import { firestore } from "./firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export type CheckInRecord = {
  id: string;
  gymId: string;
  gymName: string;
  timestamp: { seconds: number; nanoseconds: number }; // Firestore timestamp format
};

// Function to log a check-in for a user with the gym name
export const logCheckIn = async (
  uid: string,
  gymId: string,
  gymName: string
): Promise<void> => {
  const checkInRef = collection(firestore, `users/${uid}/checkIns`);

  try {
    // Create a new check-in document with the gym name
    await addDoc(checkInRef, {
      gymId,
      gymName,
      timestamp: Timestamp.now(), // Firestore timestamp for consistency
    });
    console.log("Check-in logged successfully");
  } catch (error) {
    console.error("Error logging check-in:", error);
    throw error;
  }
};

export const getCheckInHistory = async (
  uid: string
): Promise<CheckInRecord[]> => {
  const checkInRef = collection(firestore, `users/${uid}/checkIns`);

  const checkInQuery = query(checkInRef);

  try {
    const snapshot = await getDocs(checkInQuery);
    const checkIns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return checkIns as CheckInRecord[];
  } catch (error) {
    console.error("Error retrieving check-in history:", error);
    throw error;
  }
};
