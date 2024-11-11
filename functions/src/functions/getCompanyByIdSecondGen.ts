// functions/src/functions/getCompanyById.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { getCompanyById } from "../services/hubspotService";

const corsHandler = cors({ origin: true }); // Allow all origins, or specify allowed origins

export const getCompanyByIdSecondGen = onRequest((req, res) => {
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

      // Decode the companyId parameter
      const companyId = req.query.companyId as string;
      if (!companyId) {
        res.status(400).send('Query parameter "companyId" is required');
        return;
      }

      // Use the HubSpotService to fetch the company by ID
      const companyData = await getCompanyById(companyId);
      res.json({ company: companyData });
    } catch (error) {
      console.error("Error fetching company data:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});
