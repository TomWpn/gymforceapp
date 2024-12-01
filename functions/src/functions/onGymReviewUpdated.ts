import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { updateGymRating } from "../services/gymService";

export const onGymReviewUpdated = onDocumentUpdated(
  "gyms/{gymId}/reviews/{reviewId}",
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();
    if (!beforeData || !afterData) return;

    const gymId = event.params.gymId;
    const newRating = afterData.rating;
    const previousRating = beforeData.rating;

    if (newRating === previousRating) {
      console.log("No changes to the review rating. Skipping update.");
      return;
    }

    try {
      await updateGymRating(gymId, newRating, previousRating);
      console.log(
        `Gym rating updated successfully on review update for gymId: ${gymId}`
      );
    } catch (error) {
      console.error(
        `Error updating gym rating on review update for gymId: ${gymId}`,
        error
      );
    }
  }
);
