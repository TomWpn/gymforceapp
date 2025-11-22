import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface ContestCheckInRequest {
  userId: string;
  gymId: string;
  gymName: string;
}

interface ContestCheckInResponse {
  success: boolean;
  contestEnrolled: boolean;
  contestId?: string;
  pointsEarned?: number;
  newTotalPoints?: number;
  currentRank?: number;
  message: string;
}

interface ParticipantData {
  userId: string;
  contestId: string;
  displayName: string;
  points: number;
  checkIns: number;
  streak: number;
  rank: number;
  joinedAt: admin.firestore.Timestamp;
  lastCheckInAt: admin.firestore.Timestamp | null;
}

export const handleContestCheckIn = onCall(
  async (request): Promise<ContestCheckInResponse> => {
    console.log("🎯 handleContestCheckIn function called!");
    console.log("Request data:", request.data);
    console.log(
      "Request auth:",
      request.auth ? "Authenticated" : "Not authenticated"
    );

    const { userId, gymId, gymName } = request.data as ContestCheckInRequest;
    console.log("Parsed parameters:", { userId, gymId, gymName });

    // Verify authentication
    if (!request.auth) {
      console.error("❌ Authentication failed - no auth object");
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the caller is the same user they're trying to operate on
    console.log("🔐 Verifying user identity:", {
      authUid: request.auth.uid,
      requestedUserId: userId,
    });
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

    console.log("✅ All validations passed, proceeding with contest logic...");

    const db = admin.firestore();

    try {
      // Note: Check-in validation is now handled by logSecureCheckIn function
      // This function only handles contest-specific logic

      // Step 1: Check if contests are enabled
      const featureFlagsDoc = await db
        .collection("config")
        .doc("featureFlags")
        .get();
      if (!featureFlagsDoc.exists) {
        return {
          success: true,
          contestEnrolled: false,
          message: "Check-in successful - contests not configured",
        };
      }

      const featureFlags = featureFlagsDoc.data();
      if (!featureFlags?.checkInContestEnabled) {
        return {
          success: true,
          contestEnrolled: false,
          message: "Check-in successful - contests disabled",
        };
      }

      // Step 2: Get active contest
      const activeContestId = featureFlags.activeContestId;
      if (!activeContestId) {
        return {
          success: true,
          contestEnrolled: false,
          message: "Check-in successful - no active contest",
        };
      }

      const contestDoc = await db
        .collection("contests")
        .doc(activeContestId)
        .get();
      if (!contestDoc.exists) {
        return {
          success: true,
          contestEnrolled: false,
          message: "Check-in successful - active contest not found",
        };
      }

      const contest = contestDoc.data();
      const now = new Date();
      const startDate = contest?.startDate?.toDate();
      const endDate = contest?.endDate?.toDate();

      // Check if contest is within date range
      if (!startDate || !endDate || now < startDate || now > endDate) {
        return {
          success: true,
          contestEnrolled: false,
          message: "Check-in successful - contest not in active period",
        };
      }

      // Step 3: Check if user is already in contest, if not auto-enroll them
      const participantId = `${activeContestId}_${userId}`;
      const participantRef = db
        .collection("contestParticipants")
        .doc(participantId);
      const participantDoc = await participantRef.get();

      let wasAutoEnrolled = false;
      let currentParticipantData: Partial<ParticipantData> = {};

      if (!participantDoc.exists) {
        // Auto-enroll user in contest
        console.log(
          `Auto-enrolling user ${userId} in contest ${activeContestId}`
        );

        // Get user display name
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const displayName =
          userData?.displayName || userData?.firstName || "Anonymous User";

        const newParticipantData = {
          userId,
          contestId: activeContestId,
          displayName,
          points: 0,
          checkIns: 0,
          streak: 0,
          rank: 0,
          joinedAt: admin.firestore.Timestamp.now(),
          lastCheckInAt: null,
        };

        await participantRef.set(newParticipantData);
        currentParticipantData = newParticipantData;
        wasAutoEnrolled = true;

        // Update contest participant count
        await contestDoc.ref.update({
          participants: admin.firestore.FieldValue.increment(1),
        });
      } else {
        currentParticipantData =
          (participantDoc.data() as ParticipantData) || {};
      }

      // Step 4: Update contest score and stats
      const pointsToAdd = 10; // Standard points per check-in
      const newPoints = (currentParticipantData.points || 0) + pointsToAdd;
      const newCheckIns = (currentParticipantData.checkIns || 0) + 1;

      // Calculate streak
      const lastCheckIn = currentParticipantData.lastCheckInAt?.toDate();
      const isConsecutiveDay =
        lastCheckIn &&
        now.getTime() - lastCheckIn.getTime() <= 48 * 60 * 60 * 1000 && // Within 48 hours
        (now.getDate() !== lastCheckIn.getDate() ||
          now.getMonth() !== lastCheckIn.getMonth()); // Different day

      const newStreak = isConsecutiveDay
        ? (currentParticipantData.streak || 0) + 1
        : 1;

      console.log(`📊 Updating participant ${participantId}:`, {
        oldPoints: currentParticipantData.points || 0,
        newPoints,
        oldCheckIns: currentParticipantData.checkIns || 0,
        newCheckIns,
        oldStreak: currentParticipantData.streak || 0,
        newStreak,
      });

      // Update participant data - use set with merge to handle race conditions
      await participantRef.set(
        {
          points: newPoints,
          checkIns: newCheckIns,
          lastCheckInAt: admin.firestore.Timestamp.now(),
          streak: newStreak,
        },
        { merge: true }
      );

      console.log(`✅ Successfully updated participant ${participantId}`);

      // Step 5: Update ranks for all participants (run in background)
      updateContestRanks(activeContestId).catch((error) => {
        console.error("Error updating contest ranks:", error);
      });

      // Step 6: Get updated rank for this user
      const updatedRank = await getUserRank(activeContestId, userId);

      console.log(
        `Contest check-in processed for user ${userId}: +${pointsToAdd} points, total: ${newPoints}, rank: ${updatedRank}`
      );

      return {
        success: true,
        contestEnrolled: true,
        contestId: activeContestId,
        pointsEarned: pointsToAdd,
        newTotalPoints: newPoints,
        currentRank: updatedRank,
        message: wasAutoEnrolled
          ? "Check-in successful - auto-enrolled in contest and earned points!"
          : "Check-in successful - contest points earned!",
      };
    } catch (error) {
      console.error("Error processing contest check-in:", error);

      // Return success for check-in but indicate contest processing failed
      return {
        success: true,
        contestEnrolled: false,
        message: "Check-in successful - contest processing failed",
      };
    }
  }
);

// Helper function to update contest ranks
async function updateContestRanks(contestId: string): Promise<void> {
  const db = admin.firestore();

  try {
    console.log(`🏆 Starting rank update for contest ${contestId}...`);

    const participantsSnapshot = await db
      .collection("contestParticipants")
      .where("contestId", "==", contestId)
      .orderBy("points", "desc")
      .orderBy("checkIns", "desc")
      .get();

    console.log(
      `📊 Found ${participantsSnapshot.docs.length} participants to rank`
    );

    const batch = db.batch();

    participantsSnapshot.docs.forEach((doc, index) => {
      const participantData = doc.data();
      console.log(
        `  Ranking #${index + 1}: ${participantData.displayName} (${
          participantData.points
        } points, ${participantData.checkIns} check-ins)`
      );
      batch.update(doc.ref, { rank: index + 1 });
    });

    await batch.commit();
    console.log(
      `✅ Successfully updated ranks for ${participantsSnapshot.docs.length} participants in contest ${contestId}`
    );
  } catch (error) {
    console.error(`❌ Error updating contest ranks for ${contestId}:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// Helper function to get user's current rank
async function getUserRank(contestId: string, userId: string): Promise<number> {
  const db = admin.firestore();

  try {
    const participantDoc = await db
      .collection("contestParticipants")
      .doc(`${contestId}_${userId}`)
      .get();

    return participantDoc.data()?.rank || 0;
  } catch (error) {
    console.error("Error getting user rank:", error);
    return 0;
  }
}
