import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { updateGymRating } from "../services/gymService";

export const onGymReviewCreated = onDocumentCreated(
  "gyms/{gymId}/reviews/{reviewId}",
  async (event) => {
    const reviewData = event.data?.data();
    if (!reviewData) return;

    const gymId = event.params.gymId;
    const newRating = reviewData.rating;

    try {
      await updateGymRating(gymId, newRating);
      console.log(`Gym rating updated successfully for gymId: ${gymId}`);
    } catch (error) {
      console.error(`Error updating gym rating for gymId: ${gymId}`, error);
    }
  }
);
