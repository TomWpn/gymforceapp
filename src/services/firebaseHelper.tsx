import { firestore } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";

// Fetch gym data from Firestore
export const getGymFromFirestore = async (gymId: string) => {
  const gymRef = doc(firestore, "gyms", gymId);
  const gymDoc = await getDoc(gymRef);
  return gymDoc.exists() ? gymDoc.data() : null;
};

// Fetch a specific user's review for a gym
export const getUserReviewFromFirestore = async (
  gymId: string,
  userId: string
) => {
  const reviewRef = doc(firestore, "gyms", gymId, "reviews", userId); // Assuming userId is the document ID
  const reviewDoc = await getDoc(reviewRef);
  return reviewDoc.exists() ? reviewDoc.data() : null;
};

// Add or update a user's review for a gym
export const addOrUpdateReviewToFirestore = async ({
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
  ownerNote?: string;
}) => {
  const reviewRef = doc(firestore, "gyms", gymId, "reviews", userId); // Use userId as document ID
  const reviewData = {
    userId,
    rating,
    comment,
    ownerNote,
    timestamp: new Date(),
  };
  await setDoc(reviewRef, reviewData, { merge: true }); // Ensure single review per user
};

export const getAllReviewsForGym = async (
  gymId: string,
  {
    lastDoc,
    pageSize = 10,
    sort = "highest",
  }: { lastDoc?: QueryDocumentSnapshot; pageSize?: number; sort?: string }
) => {
  const reviewsCollectionRef = collection(firestore, "gyms", gymId, "reviews");

  let queryRef = query(reviewsCollectionRef, limit(pageSize));

  // Apply sorting
  if (sort === "highest") {
    queryRef = query(queryRef, orderBy("rating", "desc"));
  } else if (sort === "lowest") {
    queryRef = query(queryRef, orderBy("rating", "asc"));
  }

  // Apply pagination using startAfter
  if (lastDoc) {
    queryRef = query(queryRef, startAfter(lastDoc));
  }

  const reviewSnapshot = await getDocs(queryRef);

  // Capture the last document for pagination
  const lastVisible = reviewSnapshot.docs[reviewSnapshot.docs.length - 1];

  const reviews = reviewSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    reviews,
    lastDoc: lastVisible,
    hasMore: reviews.length === pageSize,
  };
};
