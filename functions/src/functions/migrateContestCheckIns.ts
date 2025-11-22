import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

const migrationSecret = defineSecret("MIGRATION_SECRET");

interface CheckInRecord {
  userId: string;
  gymId: string;
  gymName: string;
  timestamp: admin.firestore.Timestamp;
}

interface ContestData {
  startDate: admin.firestore.Timestamp;
  endDate: admin.firestore.Timestamp;
  participants?: number;
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
  gymName?: string;
  gymLogo?: string;
}

/**
 * Migration function to retroactively update contest participants
 * for all check-ins that occurred during the contest period.
 *
 * This is a one-time migration to fix the bug where participants
 * weren't being properly updated.
 *
 * Usage: Call this HTTPS endpoint with a secret key:
 * POST https://us-central1-gymforceapp-778e1.cloudfunctions.net/migrateContestCheckIns
 * Body: { "secret": "YOUR_SECRET_KEY", "dryRun": true }
 *
 * Set "dryRun": true to preview changes without writing to database
 */
export const migrateContestCheckIns = onRequest(
  {
    cors: true,
    secrets: [migrationSecret],
  },
  async (req, res) => {
    console.log("🔄 Starting contest check-in migration...");
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    console.log("Request body:", JSON.stringify(req.body));

    // Simple authentication - check both body and header
    const secretFromBody = req.body?.secret;
    const secretFromHeader = req.headers["x-migration-secret"] as string;
    const secret = secretFromBody || secretFromHeader;
    const expectedSecret = migrationSecret.value();
    const dryRun = req.body?.dryRun === true;

    console.log("Secret validation:", {
      hasSecretInBody: !!secretFromBody,
      hasSecretInHeader: !!secretFromHeader,
      hasExpectedSecret: !!expectedSecret,
      secretLength: secret?.length,
      expectedLength: expectedSecret?.length,
      dryRun,
    });

    if (!secret || secret !== expectedSecret) {
      console.error("❌ Unauthorized migration attempt - secrets don't match");
      res.status(401).json({
        error: "Unauthorized",
        hint: "Provide secret in body or X-Migration-Secret header",
      });
      return;
    }

    if (dryRun) {
      console.log("========================================");
      console.log("🔍 DRY RUN MODE - No changes will be written to database");
      console.log("========================================");
    } else {
      console.log("========================================");
      console.log("✅ Authentication successful, proceeding with migration...");
      console.log("⚠️  WARNING: This will modify the database!");
      console.log("========================================");
    }

    const db = admin.firestore();

    try {
      // Step 1: Get active contest
      const featureFlagsDoc = await db
        .collection("config")
        .doc("featureFlags")
        .get();

      if (!featureFlagsDoc.exists) {
        throw new Error("Feature flags not found");
      }

      const featureFlags = featureFlagsDoc.data();
      const activeContestId = featureFlags?.activeContestId;

      if (!activeContestId) {
        throw new Error("No active contest found");
      }

      console.log(`📊 Found active contest: ${activeContestId}`);

      // Step 2: Get contest details
      const contestDoc = await db
        .collection("contests")
        .doc(activeContestId)
        .get();

      if (!contestDoc.exists) {
        throw new Error("Active contest not found in database");
      }

      const contest = contestDoc.data() as ContestData;
      const startDate = contest.startDate.toDate();
      const endDate = contest.endDate.toDate();

      console.log("\n📅 Contest Information:");
      console.log(`   ID: ${activeContestId}`);
      console.log(
        `   Period: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );
      console.log(`   Current Participants: ${contest.participants || 0}`);

      // Step 3: Get all check-ins during contest period across all users
      console.log("\n🔍 Querying all check-ins during contest period...");

      const allUsersSnapshot = await db.collection("users").get();
      let totalCheckIns = 0;
      let totalUsersProcessed = 0;
      let totalNewParticipants = 0;
      let totalUpdatedParticipants = 0;

      const userCheckIns = new Map<string, CheckInRecord[]>();

      // Collect all check-ins from all users
      for (const userDoc of allUsersSnapshot.docs) {
        const userId = userDoc.id;

        const checkInsSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("checkIns")
          .where(
            "timestamp",
            ">=",
            admin.firestore.Timestamp.fromDate(startDate)
          )
          .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endDate))
          .orderBy("timestamp", "asc")
          .get();

        if (!checkInsSnapshot.empty) {
          const checkIns: CheckInRecord[] = checkInsSnapshot.docs.map((doc) => {
            const checkInData = doc.data();
            const checkInTimestamp =
              checkInData.timestamp as admin.firestore.Timestamp;
            console.log(
              `    Check-in: ${checkInTimestamp
                .toDate()
                .toISOString()} for user ${userId}`
            );
            return {
              userId,
              gymId: checkInData.gymId,
              gymName: checkInData.gymName,
              timestamp: checkInTimestamp,
            };
          });

          userCheckIns.set(userId, checkIns);
          totalCheckIns += checkIns.length;
          console.log(
            `  Found ${checkIns.length} check-ins for user ${userId}`
          );
        }
      }

      console.log(
        `\n📈 Summary: Found ${totalCheckIns} check-ins from ${userCheckIns.size} users during contest period`
      );

      // Step 4: Process each user's check-ins
      console.log("\n👥 Processing Users:");
      console.log("==================");

      for (const [userId, checkIns] of userCheckIns.entries()) {
        console.log(`\n👤 User ${userId} (${checkIns.length} check-ins)...`);

        // Get user display name and gym info
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const displayName =
          userData?.displayName || userData?.firstName || "Anonymous User";
        const gymName = userData?.gym?.properties?.name;
        const gymLogo = userData?.gym?.properties?.app_background_image_url;

        console.log(`   Name: ${displayName}`);
        if (gymName) {
          console.log(`   Gym: ${gymName}`);
        } else {
          console.log(`   Gym: (none)`);
        }

        const participantId = `${activeContestId}_${userId}`;
        const participantRef = db
          .collection("contestParticipants")
          .doc(participantId);

        // Check if participant already exists
        const participantDoc = await participantRef.get();
        const isNewParticipant = !participantDoc.exists;

        if (isNewParticipant) {
          console.log(`   Status: ✨ NEW participant`);
          totalNewParticipants++;
        } else {
          console.log(`   Status: 🔄 EXISTING participant (will update)`);
          totalUpdatedParticipants++;
        }

        // Calculate points, check-ins, and streak
        // Group by UTC calendar day to ensure one check-in per day
        const checkInsByDay = new Map<string, CheckInRecord>();
        
        checkIns.forEach((checkIn) => {
          const date = checkIn.timestamp.toDate();
          const dayKey = `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
          ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
          
          // Keep the first check-in of each day (checkIns are ordered by timestamp asc)
          if (!checkInsByDay.has(dayKey)) {
            checkInsByDay.set(dayKey, checkIn);
          }
        });

        // Convert to array and sort by date
        const uniqueCheckIns = Array.from(checkInsByDay.entries())
          .sort((a, b) => a[0].localeCompare(b[0])) // Sort by dayKey (YYYY-MM-DD)
          .map(([, checkIn]) => checkIn);

        const pointsPerCheckIn = 10;
        const totalCheckInsCount = uniqueCheckIns.length;
        const totalPoints = totalCheckInsCount * pointsPerCheckIn;

        // Calculate streak (consecutive UTC calendar days)
        let maxStreak = uniqueCheckIns.length > 0 ? 1 : 0;
        let currentStreak = uniqueCheckIns.length > 0 ? 1 : 0;

        for (let i = 1; i < uniqueCheckIns.length; i++) {
          const prevDate = uniqueCheckIns[i - 1].timestamp.toDate();
          const currDate = uniqueCheckIns[i].timestamp.toDate();

          // Calculate day difference using UTC dates
          const prevDay = Date.UTC(
            prevDate.getUTCFullYear(),
            prevDate.getUTCMonth(),
            prevDate.getUTCDate()
          );
          const currDay = Date.UTC(
            currDate.getUTCFullYear(),
            currDate.getUTCMonth(),
            currDate.getUTCDate()
          );
          const daysDiff = Math.round(
            (currDay - prevDay) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else if (daysDiff > 1) {
            currentStreak = 1;
          }
        }

        const lastCheckIn = uniqueCheckIns.length > 0 
          ? uniqueCheckIns[uniqueCheckIns.length - 1].timestamp 
          : null;
        const firstCheckIn = uniqueCheckIns.length > 0
          ? uniqueCheckIns[0].timestamp
          : null;

        // Log if user had duplicate check-ins on same day
        if (checkIns.length !== uniqueCheckIns.length) {
          console.log(
            `  ⚠️  User had ${checkIns.length - uniqueCheckIns.length} duplicate same-day check-ins (${checkIns.length} total -> ${uniqueCheckIns.length} unique days)`
          );
        }

        // Sanity check: ensure all check-ins are within contest period
        if (lastCheckIn && firstCheckIn) {
          const lastCheckInDate = lastCheckIn.toDate();
          const firstCheckInDate = firstCheckIn.toDate();

          if (lastCheckInDate < startDate || firstCheckInDate > endDate) {
            console.log(
              `  ⚠️  WARNING: User ${displayName} has check-ins outside contest period!`
            );
            console.log(`     First check-in: ${firstCheckInDate.toISOString()}`);
            console.log(`     Last check-in: ${lastCheckInDate.toISOString()}`);
            console.log(
              `     Contest: ${startDate.toISOString()} to ${endDate.toISOString()}`
            );
          }

          console.log(
            `  📅 Check-in dates: ${firstCheckInDate.toISOString()} to ${lastCheckInDate.toISOString()}`
          );
        }

        // Create or update participant data
        const participantData: ParticipantData = {
          userId,
          contestId: activeContestId,
          displayName,
          points: totalPoints,
          checkIns: totalCheckInsCount,
          streak: maxStreak,
          rank: 0, // Will be updated in next step
          joinedAt: isNewParticipant
            ? firstCheckIn!
            : participantDoc.data()?.joinedAt || firstCheckIn!,
          lastCheckInAt: lastCheckIn,
          ...(gymName && { gymName }),
          ...(gymLogo && { gymLogo }),
        };

        if (!dryRun) {
          await participantRef.set(participantData, { merge: true });
          console.log(
            `   ✅ Updated: ${totalPoints} points, ${totalCheckInsCount} check-ins, ${maxStreak} streak${
              gymName ? `, gym: ${gymName}` : ""
            }`
          );
        } else {
          console.log(
            `   📋 Would update: ${totalPoints} points, ${totalCheckInsCount} check-ins, ${maxStreak} streak${
              gymName ? `, gym: ${gymName}` : ""
            }`
          );
        }
        totalUsersProcessed++;
      }

      console.log("\n==================");
      console.log(`✅ Processed ${totalUsersProcessed} users`);

      // Step 5: Update contest participant count
      if (!dryRun) {
        await contestDoc.ref.update({
          participants: userCheckIns.size,
        });
        console.log(
          `\n📊 Updated contest participant count to ${userCheckIns.size}`
        );
      } else {
        console.log(
          `\n📊 Would update contest participant count to ${userCheckIns.size}`
        );
      }

      // Step 6: Update rankings for all participants
      if (!dryRun) {
        console.log("\n🏆 Updating participant rankings...");
        await updateContestRanks(activeContestId);
      } else {
        console.log("\n🏆 Skipping ranking update in dry run mode");
      }

      const summary = {
        success: true,
        dryRun,
        contestId: activeContestId,
        contestPeriod: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        stats: {
          totalUsersProcessed,
          totalCheckIns,
          newParticipants: totalNewParticipants,
          updatedParticipants: totalUpdatedParticipants,
        },
        message: dryRun
          ? "Dry run completed - no changes made"
          : "Migration completed successfully",
      };

      console.log("\n========================================");
      console.log(dryRun ? "🔍 DRY RUN SUMMARY" : "✅ MIGRATION SUMMARY");
      console.log("========================================");
      console.log(JSON.stringify(summary, null, 2));
      console.log("========================================\n");

      res.status(200).json(summary);
    } catch (error) {
      console.error("❌ Migration failed:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Helper function to update contest ranks
async function updateContestRanks(contestId: string): Promise<void> {
  const db = admin.firestore();

  try {
    const participantsSnapshot = await db
      .collection("contestParticipants")
      .where("contestId", "==", contestId)
      .orderBy("points", "desc")
      .orderBy("checkIns", "desc")
      .get();

    console.log(
      `  Ranking ${participantsSnapshot.docs.length} participants...`
    );

    const batch = db.batch();

    participantsSnapshot.docs.forEach((doc, index) => {
      const participantData = doc.data();
      console.log(
        `    #${index + 1}: ${participantData.displayName} (${
          participantData.points
        } points)`
      );
      batch.update(doc.ref, { rank: index + 1 });
    });

    await batch.commit();
    console.log(`  ✅ Rankings updated successfully`);
  } catch (error) {
    console.error("  ❌ Error updating contest ranks:", error);
    throw error;
  }
}
