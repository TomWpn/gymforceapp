# Contest Check-In Migration

## Overview

This migration script retroactively updates contest participants for all users who checked in during the active contest period. It was created to fix a bug where participant data wasn't being properly updated.

## What It Does

The migration function:

1. ✅ Finds the active contest and its date range
2. ✅ Queries all user check-ins during the contest period
3. ✅ Creates or updates contest participant records with:
   - Total points (10 points per check-in)
   - Total check-in count
   - Maximum streak (consecutive days)
   - Last check-in timestamp
4. ✅ Updates the contest participant count
5. ✅ Recalculates rankings for all participants

## Setup

### 1. Set Migration Secret

First, you need to set the `MIGRATION_SECRET` environment variable in Firebase:

```bash
firebase functions:secrets:set MIGRATION_SECRET
# Enter a secure random string when prompted (e.g., use `openssl rand -base64 32`)
```

### 2. Verify Function is Deployed

The function should already be deployed. Verify with:

```bash
firebase functions:list | grep migrateContestCheckIns
```

## Running the Migration

⚠️ **IMPORTANT: Always run a dry-run first before executing any migration!**

### Step 1: Dry Run (Required)

Always test the migration first without making changes:

```bash
# Set the migration secret
export MIGRATION_SECRET="your-secret-key-here"

# Run dry-run to preview changes
curl -X POST "https://us-central1-gymforceapp-778e1.cloudfunctions.net/migrateContestCheckIns" \
  -H "Content-Type: application/json" \
  -d '{"secret": "'"$MIGRATION_SECRET"'", "dryRun": true}'
```

**Expected Output:**

- `"success": true`
- `"dryRun": true`
- `"stats"` showing counts of users, check-ins, new and updated participants
- `"message": "Dry run completed - no changes made"`

**Check the logs to verify:**

```bash
firebase functions:log --only migrateContestCheckIns
```

Look for:

- ✅ User counts match expectations
- ✅ Check-in counts are reasonable
- ✅ Gym names appear in logs (e.g., "Would update John: 30 points, 3 check-ins, 3 max streak, gym: FitLife Gym")
- ✅ No unexpected errors or warnings
- ⚠️ Any warnings about check-ins outside contest period

### Step 2: Execute Migration (Only After Dry-Run Verification)

Once you've verified the dry-run output looks correct:

```bash
# Run the actual migration
curl -X POST "https://us-central1-gymforceapp-778e1.cloudfunctions.net/migrateContestCheckIns" \
  -H "Content-Type: application/json" \
  -d '{"secret": "'"$MIGRATION_SECRET"'"}'
```

**Expected Output:**

- `"success": true`
- `"dryRun": false`
- Same stats as dry-run
- `"message": "Migration completed successfully"`

### Step 3: Verify Results

Check the logs again to confirm changes were applied:

```bash
firebase functions:log --only migrateContestCheckIns
```

Look for:

- ✅ "Updated" instead of "Would update" messages
- ✅ Final rankings displayed
- ✅ No error messages

### Option 1: Using the Script (Recommended)

```bash
# Export the migration secret
export MIGRATION_SECRET="your-secret-key-here"

# The script will automatically run dry-run first and ask for confirmation
./run_migration.sh
```

### Option 2: Using curl directly

See steps above for manual curl commands.

## Expected Output

### Dry-Run Response

```json
{
  "success": true,
  "dryRun": true,
  "contestId": "Uhkxd4jiClcgHjxgtyYZ",
  "contestPeriod": {
    "start": "2025-11-17T05:00:00.000Z",
    "end": "2025-12-28T05:00:00.000Z"
  },
  "stats": {
    "totalUsersProcessed": 50,
    "totalCheckIns": 138,
    "newParticipants": 0,
    "updatedParticipants": 50
  },
  "message": "Dry run completed - no changes made"
}
```

### Actual Migration Response

```json
{
  "success": true,
  "dryRun": false,
  "contestId": "Uhkxd4jiClcgHjxgtyYZ",
  "contestPeriod": {
    "start": "2025-11-17T05:00:00.000Z",
    "end": "2025-12-28T05:00:00.000Z"
  },
  "stats": {
    "totalUsersProcessed": 50,
    "totalCheckIns": 138,
    "newParticipants": 0,
    "updatedParticipants": 50
  },
  "message": "Migration completed successfully"
}
```

### Log Output Examples

**Dry-Run Log:**

```
📋 Would update John: 30 points, 3 check-ins, 3 max streak, gym: FitLife Gym
📋 Would update Sarah: 50 points, 5 check-ins, 5 max streak, gym: CrossFit Box
```

**Actual Migration Log:**

```
✅ Updated John: 30 points, 3 check-ins, 3 max streak, gym: FitLife Gym
✅ Updated Sarah: 50 points, 5 check-ins, 5 max streak, gym: CrossFit Box
```

## What The Migration Does

The migration function:

1. ✅ Finds the active contest and its date range
2. ✅ Queries all user check-ins during the contest period
3. ✅ Creates or updates contest participant records with:
   - Total points (10 points per check-in)
   - Total check-in count
   - Maximum streak (consecutive days)
   - Last check-in timestamp
   - **Gym name** from user profile
   - **Gym logo URL** from user profile
4. ✅ Updates the contest participant count
5. ✅ Recalculates rankings for all participants

**Important Notes:**

- The migration reads from `users/{userId}/checkIns` subcollections (source data)
- It writes to the `contestParticipants` collection (derived data)
- Source check-in data is NEVER modified or deleted
- Uses `merge: true` to preserve any existing fields not being updated
- Gym data is only added if the user has a gym in their profile

## Monitoring

You can monitor the migration in real-time:

```bash
# In a separate terminal
firebase functions:log --only migrateContestCheckIns
```

## Safety Features

- ✅ **Authentication**: Requires secret key to run
- ✅ **Idempotent**: Safe to run multiple times (uses merge updates)
- ✅ **Read-only on check-ins**: Only reads existing check-ins, doesn't modify them
- ✅ **Detailed logging**: Comprehensive logs for debugging

## After Migration

Once the migration completes successfully:

1. Verify participant data in Firebase Console:

   - Go to Firestore → `contestParticipants` collection
   - Check that users have correct points, check-ins, and streaks

2. Check rankings are correct:

   - Participants should be ranked by points (descending)
   - Ties broken by check-ins count

3. (Optional) Delete the migration function if you don't need it anymore:
   ```bash
   firebase functions:delete migrateContestCheckIns
   ```

## Troubleshooting

### "Unauthorized" Error

- Make sure you set the `MIGRATION_SECRET` correctly
- Verify it matches the secret you set in Firebase

### "No active contest found"

- Check that `config/featureFlags` has `activeContestId` set
- Verify the contest exists in the `contests` collection

### Migration runs but no users updated

- Check the contest date range
- Verify users have check-ins in the `users/{userId}/checkIns` subcollection
- Check Firebase logs for detailed error messages

### Undefined values error (gymLogo, gymName)

- This is now handled - gym fields are only added if they exist
- Users without gyms will not have these fields set

### Dry-run shows different counts than expected

**Before proceeding:**

1. Check the Firebase logs to see which users are being processed
2. Verify the contest date range is correct
3. Confirm check-in counts match what you expect
4. Look for warnings about check-ins outside the contest period

**Do NOT run the actual migration if:**

- User counts seem way off
- Check-in counts don't make sense
- You see many warnings about data outside contest period
- Gym names aren't appearing for users you know have gyms

### Recovery from Bad Migration

If a migration runs incorrectly:

1. **Don't panic** - source check-in data is safe in `users/{userId}/checkIns`
2. Fix the migration function code
3. Deploy the updated function
4. Run dry-run to verify the fix
5. Re-run the migration - it will recalculate everything from source data

## Support

For issues or questions, check the Firebase function logs:

```bash
firebase functions:log --only migrateContestCheckIns
```
