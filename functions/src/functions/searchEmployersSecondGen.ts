// functions/src/functions/searchEmployers.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { searchEmployersInHubSpot } from "../services/hubspotService";

const corsHandler = cors({ origin: true }); // Allow all origins, or specify allowed origins

export const searchEmployersSecondGen = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(403).send("Unauthorized");
      return;
    }

    // Get the token from the Authorization header
    const idToken = authHeader.split("Bearer ")[1];

    try {
      // Verify the token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`Authenticated user ID: ${decodedToken.uid}`);

      // Decode the query parameter
      const query = req.query.q as string;
      if (!query) {
        res.status(400).send('Query parameter "q" is required');
        return;
      }

      const results = await searchEmployersInHubSpot(query); // Use the HubSpotService for the search
      res.json({ results });
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
    }
  });
});
