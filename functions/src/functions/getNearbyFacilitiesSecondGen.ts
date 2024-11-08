// functions/src/functions/getNearbyFacilities.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { getFacilitiesFromHubSpot } from "../services/hubspotService";

const corsHandler = cors({ origin: true });

export const getNearbyFacilitiesSecondGen = onRequest((req, res) => {
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

      const { lat, lng, range } = req.query;

      // Validate parameters
      if (!lat || !lng || !range) {
        res
          .status(400)
          .send('Parameters "lat", "lng", and "range" are required');
        return;
      }

      const location = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
      };
      const distance = parseFloat(range as string);

      const facilities = await getFacilitiesFromHubSpot(location, distance);
      res.json({ facilities });
    } catch (error) {
      console.error(
        "Error verifying Firebase ID token or fetching facilities:",
        error
      );
      res.status(403).send("Unauthorized");
    }
  });
});
