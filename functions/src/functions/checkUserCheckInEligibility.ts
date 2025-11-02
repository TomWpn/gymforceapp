import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface CheckInEligibilityRequest {
  userId: string;
}

interface CheckInEligibilityResponse {
  canCheckIn: boolean;
  reason?: string;
  lastCheckIn?: Date;
  nextEligibleTime?: Date;
}

export const checkUserCheckInEligibility = onCall(
  async (request): Promise<CheckInEligibilityResponse> => {
    console.log("🕐 checkUserCheckInEligibility function called!");
    console.log("Request data:", request.data);

    const { userId } = request.data as CheckInEligibilityRequest;

    // Verify authentication
    if (!request.auth) {
      console.error("❌ Authentication failed - no auth object");
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the caller is the same user they're trying to check
    if (request.auth.uid !== userId) {
      console.error("❌ Permission denied - user ID mismatch");
      throw new HttpsError(
        "permission-denied",
        "You can only check eligibility for yourself"
      );
    }

    if (!userId) {
      console.error("❌ Missing required field: userId");
      throw new HttpsError(
        "invalid-argument",
        "Missing required field: userId"
      );
    }

    const db = admin.firestore();

    try {
      // Check if user has already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

      console.log("Checking check-in eligibility for date range:", {
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString(),
      });

      const todayCheckInsQuery = await db
        .collection("users")
        .doc(userId)
        .collection("checkIns")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(today))
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(tomorrow))
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (!todayCheckInsQuery.empty) {
        const lastCheckInDoc = todayCheckInsQuery.docs[0];
        const lastCheckInData = lastCheckInDoc.data();
        const lastCheckInTime = lastCheckInData.timestamp.toDate();

        // Calculate next eligible time (tomorrow at midnight)
        const nextEligible = new Date(today);
        nextEligible.setDate(nextEligible.getDate() + 1);
        nextEligible.setHours(0, 0, 0, 0);

        console.log(
          "❌ User already checked in today at:",
          lastCheckInTime.toISOString()
        );

        return {
          canCheckIn: false,
          reason:
            "You can only check in once per day. You've already checked in today!",
          lastCheckIn: lastCheckInTime,
          nextEligibleTime: nextEligible,
        };
      }

      console.log("✅ User is eligible to check in today");

      return {
        canCheckIn: true,
      };
    } catch (error) {
      console.error("Error checking check-in eligibility:", error);
      throw new HttpsError("internal", "Failed to check check-in eligibility");
    }
  }
);
