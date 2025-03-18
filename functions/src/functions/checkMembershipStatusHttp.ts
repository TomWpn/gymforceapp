import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { EmailStatus } from "../types/gymforce";

const corsHandler = cors({ origin: true });

export const checkMembershipStatusHttp = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(403).send("Unauthorized");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`Authenticated user ID: ${decodedToken.uid}`);

      const { userId, gymId } = req.body.data;
      // console.log("Request data:", { userId, gymId });

      if (!userId || !gymId) {
        console.error("Missing required fields:", { userId, gymId });
        res.status(400).send("Missing required fields: userId and gymId");
        return;
      }

      // Verify the caller is the same user they're trying to check
      if (decodedToken.uid !== userId) {
        console.error("Auth mismatch:", {
          requestedUserId: userId,
          callerUserId: decodedToken.uid,
        });
        res
          .status(403)
          .send("You can only check membership status for yourself");
        return;
      }

      // console.log("Auth check passed, proceeding with database query");

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
        res.json({ data });
      } else {
        // console.log("No membership data found");
        res.json({ data: null });
      }
    } catch (error) {
      console.error("Error in checkMembershipStatusHttp:", error);
      res.status(500).send("Internal server error");
    }
  });
});
