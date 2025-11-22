import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface LogCheckInRequest {
  userId: string;
  gymId: string;
  gymName: string;
}

interface LogCheckInResponse {
  success: boolean;
  message: string;
  checkInId?: string;
}

/**
 * Server-side check-in function that validates once-per-day rule
 * before logging the check-in.
 */
export const logSecureCheckIn = onCall(
  async (request): Promise<LogCheckInResponse> => {
    console.log("🔒 logSecureCheckIn function called!");
    console.log("Request data:", request.data);

    const { userId, gymId, gymName } = request.data as LogCheckInRequest;

    // Verify authentication
    if (!request.auth) {
      console.error("❌ Authentication failed - no auth object");
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the caller is the same user
    if (request.auth.uid !== userId) {
      console.error("❌ Permission denied - user ID mismatch");
      throw new HttpsError(
        "permission-denied",
        "You can only check in for yourself"
      );
    }

    if (!userId || !gymId || !gymName) {
      console.error("❌ Missing required fields:", { userId, gymId, gymName });
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: userId, gymId, and gymName"
      );
    }

    const db = admin.firestore();

    try {
      // Step 1: Validate check-in eligibility (once per calendar day rule)
      // Get the current date in UTC, set to start of day
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      console.log(
        "🕐 Checking calendar day check-in eligibility for user:",
        userId
      );
      console.log("Date range check (UTC calendar day):", {
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString(),
      });

      const todayCheckInsQuery = await db
        .collection("users")
        .doc(userId)
        .collection("checkIns")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(today))
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(tomorrow))
        .get();

      if (!todayCheckInsQuery.empty) {
        console.log(
          "❌ User already checked in today. Check-ins found:",
          todayCheckInsQuery.docs.length
        );
        throw new HttpsError(
          "failed-precondition",
          "You can only check in once per day. You've already checked in today!"
        );
      }

      console.log("✅ User eligible for check-in today");

      // Step 2: Log the check-in
      const checkInRef = await db
        .collection("users")
        .doc(userId)
        .collection("checkIns")
        .add({
          gymId,
          gymName,
          timestamp: admin.firestore.Timestamp.now(),
        });

      console.log(`✅ Check-in logged successfully with ID: ${checkInRef.id}`);

      return {
        success: true,
        message: "Check-in logged successfully",
        checkInId: checkInRef.id,
      };
    } catch (error) {
      // Re-throw HttpsError as-is
      if (error instanceof HttpsError) {
        throw error;
      }

      console.error("Error logging check-in:", error);
      throw new HttpsError(
        "internal",
        "Failed to log check-in: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
);
