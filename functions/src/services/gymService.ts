import { db } from "../services/firebaseAdmin";

export const updateGymRating = async (
  gymId: string,
  newRating: number,
  previousRating?: number
) => {
  const gymRef = db.collection("gyms").doc(gymId);

  await db.runTransaction(async (transaction) => {
    const gymDoc = await transaction.get(gymRef);

    if (!gymDoc.exists) {
      console.warn(`Gym with ID ${gymId} does not exist. Creating...`);
      transaction.set(gymRef, {
        averageRating: newRating,
        totalReviews: 1,
      });
      return; // Early exit after creating the gym document
    }

    const gymData = gymDoc.data();
    const totalReviews = gymData?.totalReviews || 0;
    const averageRating = gymData?.averageRating || 0;

    let updatedTotalReviews = totalReviews;
    let updatedAverageRating = averageRating;

    if (previousRating !== undefined) {
      const newSumOfRatings =
        averageRating * totalReviews - previousRating + newRating;
      updatedAverageRating = newSumOfRatings / totalReviews;
    } else {
      updatedTotalReviews += 1;
      updatedAverageRating =
        (averageRating * totalReviews + newRating) / updatedTotalReviews;
    }

    transaction.update(gymRef, {
      averageRating: updatedAverageRating,
      totalReviews: updatedTotalReviews,
    });
  });
};
