import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const claimMembership = onCall(async (request) => {
  console.log("Starting claimMembership function");

  try {
    const { userId, gymId } = request.data;
    console.log("Received claim request:", { userId, gymId });

    if (!userId || !gymId) {
      console.error("Missing required fields:", {
        hasUserId: !!userId,
        hasGymId: !!gymId,
      });
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const docPath = `${userId}_${gymId}`;
    const membershipRef = admin
      .firestore()
      .collection("membershipInterest")
      .doc(docPath);

    const doc = await membershipRef.get();
    if (!doc.exists) {
      throw new HttpsError("not-found", "No membership interest found");
    }

    // Update the membership status
    await membershipRef.update({
      userClaimedMembership: true,
      userClaimedMembershipAt: admin.firestore.Timestamp.now(),
    });

    console.log("Successfully updated membership claim status");
    return {
      success: true,
      message:
        "Thank you for confirming your membership! You can now access all GymForce features.",
    };
  } catch (error) {
    console.error("Error in claimMembership:", error);
    if (error instanceof Error) {
      throw new HttpsError(
        "internal",
        `Error claiming membership: ${error.message}`
      );
    }
    throw new HttpsError(
      "internal",
      "Unknown error occurred while claiming membership"
    );
  }
});
