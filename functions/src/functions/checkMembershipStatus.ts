import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { EmailStatus } from "../types/gymforce";

export const checkMembershipStatus = onCall(async (request) => {
  // console.log("checkMembershipStatus function called with data:", request.data);
  // console.log("Auth context:", request.auth);

  const { userId, gymId } = request.data;

  if (!userId || !gymId) {
    console.error("Missing required fields:", { userId, gymId });
    throw new Error("Missing required fields: userId and gymId");
  }

  // Verify the caller is the same user they're trying to check
  if (!request.auth) {
    console.error("No auth context found");
    throw new Error("Unauthenticated: No auth context found");
  }

  if (request.auth.uid !== userId) {
    console.error("Auth mismatch:", {
      requestedUserId: userId,
      callerUserId: request.auth.uid,
    });
    throw new Error(
      "Unauthorized: You can only check membership status for yourself"
    );
  }

  // console.log("Auth check passed, proceeding with database query");

  try {
    const docRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("membershipInterest")
      .doc(gymId);

    // console.log("Attempting to fetch document at path:", docRef.path);

    const docSnap = await docRef.get();
    // console.log("Document exists:", docSnap.exists);

    if (docSnap.exists) {
      const data = docSnap.data() as EmailStatus;
      // console.log("Found membership data:", data);
      return { data };
    }

    // console.log("No membership data found");
    return { data: null };
  } catch (error) {
    console.error("Error accessing Firestore:", error);
    throw new Error("Failed to check membership status");
  }
});
