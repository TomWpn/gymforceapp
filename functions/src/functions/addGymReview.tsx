import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase app
initializeApp();
const db = getFirestore();

export const addGymReview = onDocumentCreated(
  "gyms/{gymId}/reviews/{reviewId}",
  async (event) => {
    const reviewData = event.data?.data();
    if (!reviewData) return;

    const gymId = event.params.gymId;
    const newRating = reviewData.rating;

    const gymRef = db.collection("gyms").doc(gymId);

    await db.runTransaction(async (transaction) => {
      const gymDoc = await transaction.get(gymRef);
      if (!gymDoc.exists) {
        throw new Error("Gym does not exist");
      }

      const gymData = gymDoc.data();
      const totalReviews = gymData?.totalReviews || 0;
      const averageRating = gymData?.averageRating || 0;

      const updatedTotalReviews = totalReviews + 1;
      const updatedAverageRating =
        (averageRating * totalReviews + newRating) / updatedTotalReviews;

      transaction.update(gymRef, {
        averageRating: updatedAverageRating,
        totalReviews: updatedTotalReviews,
      });
    });
  }
);
