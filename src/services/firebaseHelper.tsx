// src/services/firebaseHelper.ts
import { firestore } from "./firebaseConfig";
import { collection, doc, getDoc, addDoc } from "firebase/firestore";

export const getGymFromFirestore = async (gymId: string) => {
  const gymRef = doc(firestore, "gyms", gymId);
  const gymDoc = await getDoc(gymRef);
  return gymDoc.exists() ? gymDoc.data() : null;
};

export const addReviewToFirestore = async ({
  gymId,
  userId,
  rating,
  comment = "",
  ownerNote = "",
}: {
  gymId: string;
  userId: string;
  rating: number;
  comment: string;
  ownerNote: string;
}) => {
  const reviewsCollectionRef = collection(
    doc(firestore, "gyms", gymId),
    "reviews"
  );
  const reviewData = {
    userId,
    rating,
    comment,
    ownerNote,
    timestamp: new Date(),
  };
  await addDoc(reviewsCollectionRef, reviewData);
};
