// functions/src/functions/createCompany.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { createCompanyInHubSpot } from "../services/hubspotService";

const corsHandler = cors({ origin: true }); // Allow all origins, or specify allowed origins

export const createCompanySecondGen = onRequest((req, res) => {
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

      // Extract company data from the request body
      const companyData = req.body;
      if (!companyData || !companyData.name) {
        res
          .status(400)
          .send('Request body must include at least a "name" field');
        return;
      }

      // Call the HubSpot service to create the company
      const createdCompany = await createCompanyInHubSpot(companyData);

      // Return the created company data
      res.status(201).json({ company: createdCompany });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});
