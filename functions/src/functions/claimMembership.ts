import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const claimMembership = onCall(async (request) => {
  const { userId, gymId } = request.data;

  if (!userId || !gymId) {
    throw new Error("Missing required fields: userId and gymId");
  }

  // Verify the caller is the same user they're trying to operate on
  if (request.auth?.uid !== userId) {
    throw new Error("Unauthorized: You can only claim membership for yourself");
  }

  try {
    const docRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("membershipInterest")
      .doc(gymId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Create a new membership interest document if it doesn't exist
      await docRef.set({
        userId,
        gymId,
        userClaimedMembership: true,
        userClaimedMembershipAt: admin.firestore.Timestamp.now(),
        sent: false, // No email sent yet
      });
    } else {
      // Update existing document
      await docRef.update({
        userClaimedMembership: true,
        userClaimedMembershipAt: admin.firestore.Timestamp.now(),
      });
    }

    return { success: true, message: "Membership claimed successfully" };
  } catch (error) {
    console.error("Error claiming membership:", error);
    throw new Error("Failed to claim membership");
  }
});
