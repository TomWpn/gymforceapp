import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

const migrationSecret = defineSecret("MIGRATION_SECRET");

interface CheckInDoc {
  id: string;
  gymId: string;
  gymName: string;
  timestamp: admin.firestore.Timestamp;
}

/**
 * Migration function to remove duplicate check-ins on the same day.
 * Keeps only the FIRST check-in of each day for each user.
 *
 * Usage: Call this HTTPS endpoint with the migration secret:
 * POST https://us-central1-gymforceapp-778e1.cloudfunctions.net/removeDuplicateCheckIns
 * Headers: X-Migration-Secret: YOUR_SECRET_KEY
 */
export const removeDuplicateCheckIns = onRequest(
  {
    cors: true,
    secrets: [migrationSecret],
  },
  async (req, res) => {
    console.log("🧹 Starting duplicate check-ins removal migration...");
    console.log("Request method:", req.method);

    // Authentication
    const secretFromBody = req.body?.secret;
    const secretFromHeader = req.headers["x-migration-secret"] as string;
    const secret = secretFromBody || secretFromHeader;
    const expectedSecret = migrationSecret.value();

    if (!secret || secret !== expectedSecret) {
      console.error("❌ Unauthorized migration attempt");
      res.status(401).json({
        error: "Unauthorized",
        hint: "Provide secret in body or X-Migration-Secret header",
      });
      return;
    }

    console.log("✅ Authentication successful, proceeding with migration...");

    // Check if this is a dry run
    const dryRun = req.body?.dryRun === true;
    if (dryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be made to the database");
    } else {
      console.log("⚠️  LIVE MODE - Changes will be written to the database");
    }

    const db = admin.firestore();

    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();
      console.log(`📊 Found ${usersSnapshot.docs.length} users to process`);

      let totalDuplicatesRemoved = 0;
      let totalUsersProcessed = 0;
      let totalUsersWithDuplicates = 0;

      const userResults: Array<{
        userId: string;
        duplicatesRemoved: number;
        daysAffected: number;
      }> = [];

      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        console.log(`\n👤 Processing user ${userId}...`);

        // Get all check-ins for this user, ordered by timestamp
        const checkInsSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("checkIns")
          .orderBy("timestamp", "asc")
          .get();

        if (checkInsSnapshot.empty) {
          console.log(`  ℹ️  No check-ins found for user ${userId}`);
          continue;
        }

        console.log(
          `  📅 Found ${checkInsSnapshot.docs.length} total check-ins`
        );

        // Group check-ins by day
        const checkInsByDay = new Map<string, CheckInDoc[]>();

        checkInsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp as admin.firestore.Timestamp;
          const date = timestamp.toDate();

          // Create day key using UTC (YYYY-MM-DD) to match server-side validation
          const dayKey = `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
          ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

          const checkIn: CheckInDoc = {
            id: doc.id,
            gymId: data.gymId,
            gymName: data.gymName,
            timestamp: timestamp,
          };

          if (!checkInsByDay.has(dayKey)) {
            checkInsByDay.set(dayKey, []);
          }
          checkInsByDay.get(dayKey)!.push(checkIn);
        });

        // Find and remove duplicates
        const duplicatesToRemove: string[] = [];
        const daysWithDuplicates: string[] = [];

        for (const [dayKey, checkIns] of checkInsByDay.entries()) {
          if (checkIns.length > 1) {
            console.log(
              `  ⚠️  Found ${checkIns.length} check-ins on ${dayKey}:`
            );
            daysWithDuplicates.push(dayKey);

            // Sort by timestamp to ensure we keep the first one
            checkIns.sort(
              (a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()
            );

            // Log all check-ins for this day
            checkIns.forEach((checkIn, index) => {
              const timeStr = checkIn.timestamp.toDate().toISOString();
              if (index === 0) {
                console.log(`    ✅ KEEPING: ${timeStr} at ${checkIn.gymName}`);
              } else {
                console.log(
                  `    ❌ REMOVING: ${timeStr} at ${checkIn.gymName}`
                );
                duplicatesToRemove.push(checkIn.id);
              }
            });
          }
        }

        // Remove duplicates in batches
        if (duplicatesToRemove.length > 0) {
          if (dryRun) {
            console.log(
              `  🔍 DRY RUN: Would remove ${duplicatesToRemove.length} duplicate check-ins`
            );
          } else {
            console.log(
              `  🗑️  Removing ${duplicatesToRemove.length} duplicate check-ins...`
            );

            const batch = db.batch();
            let batchCount = 0;

            for (const docId of duplicatesToRemove) {
              const docRef = db
                .collection("users")
                .doc(userId)
                .collection("checkIns")
                .doc(docId);
              batch.delete(docRef);
              batchCount++;

              // Firestore batch limit is 500 operations
              if (batchCount === 500) {
                await batch.commit();
                console.log(`    ✅ Committed batch of ${batchCount} deletions`);
                batchCount = 0;
              }
            }

            // Commit remaining deletions
            if (batchCount > 0) {
              await batch.commit();
              console.log(
                `    ✅ Committed final batch of ${batchCount} deletions`
              );
            }
          }

          totalDuplicatesRemoved += duplicatesToRemove.length;
          totalUsersWithDuplicates++;

          userResults.push({
            userId,
            duplicatesRemoved: duplicatesToRemove.length,
            daysAffected: daysWithDuplicates.length,
          });

          console.log(
            `  ✅ Removed ${duplicatesToRemove.length} duplicates across ${daysWithDuplicates.length} days`
          );
        } else {
          console.log(`  ✅ No duplicates found for this user`);
        }

        totalUsersProcessed++;
      }

      const summary = {
        success: true,
        dryRun,
        stats: {
          totalUsersProcessed,
          totalUsersWithDuplicates,
          totalDuplicatesRemoved,
        },
        usersWithDuplicates: userResults,
        message: dryRun
          ? "Dry run completed - no changes were made"
          : "Duplicate check-ins removal completed successfully",
      };

      console.log("\n📊 Migration Summary:");
      console.log(`  Total users processed: ${totalUsersProcessed}`);
      console.log(`  Users with duplicates: ${totalUsersWithDuplicates}`);
      console.log(`  Total duplicates removed: ${totalDuplicatesRemoved}`);

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
