import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import axios from "axios";
import { getCompanyById } from "../services/hubspotService";
import * as nodemailer from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

// Environment variables
const HUBSPOT_OAUTH_ACCESS_TOKEN = defineString("HUBSPOT_OAUTH_ACCESS_TOKEN");
const EMAIL_USER = defineString("EMAIL_USER");
const EMAIL_PASS = defineString("EMAIL_PASS");

// API URLs
const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const HUBSPOT_COMPANIES_URL = `${HUBSPOT_BASE_URL}/crm/v3/objects/companies`;
const HUBSPOT_CONTACTS_URL = `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`;

const FUNCTION_HOST_URL = defineString("FUNCTION_HOST_URL");

import { MembershipInterestData, EmailStatus } from "../types/gymforce";

// Function to create the email HTML content
const createEmailContent = (
  data: MembershipInterestData,
  gymName: string,
  verificationToken: string
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GymForce - New Membership Interest</title>
    <style type="text/css">
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #1a265a; padding: 30px 20px; text-align: center; color: #ffffff; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .highlight { color: #f1600d; font-weight: bold; }
        .contact-info { margin-top: 25px; padding: 20px; background-color: #f9f9f9; border-radius: 5px; border-left: 4px solid #1a265a; }
        .footer { background-color: #1a265a; color: #ffffff; text-align: center; padding: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Membership Interest</h1>
            <p>via GymForce</p>
        </div>

        <div class="content">
            <p>A potential member has expressed interest in joining <span class="highlight">${gymName}</span> through the GymForce app.</p>
            
            <div class="contact-info">
                <h2>Contact Information</h2>
                <p><strong>Name:</strong> ${data.userName}</p>
                <p><strong>Email:</strong> ${data.userEmail}</p>
                ${
                  data.userPhone
                    ? `<p><strong>Phone:</strong> ${data.userPhone}</p>`
                    : ""
                }
            </div>

            <p style="margin-top: 25px;">Please reach out to discuss membership options and help them start their fitness journey!</p>
            
            <div style="margin-top: 30px; text-align: center;">
                <p style="margin-bottom: 20px; color: #1a265a;"><strong>Important Next Steps:</strong></p>
                <ol style="text-align: left; margin-bottom: 25px; padding-left: 25px;">
                    <li style="margin-bottom: 10px;">Reach out to discuss membership options</li>
                    <li style="margin-bottom: 10px;">Once they become a member, click the verification button below</li>
                    <li style="margin-bottom: 10px;">Their membership will be automatically verified in the GymForce system</li>
                    <li style="margin-bottom: 10px;">They can immediately start using all GymForce features</li>
                </ol>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="margin-bottom: 15px; font-size: 14px;">Click the button below to instantly verify their membership:</p>
                    <a href="${FUNCTION_HOST_URL.value()}/verifyMembershipHttp?userId=${
  data.userId
}&gymId=${data.gymId}&token=${verificationToken}"
                       style="background-color: #f1600d;
                              color: white;
                              padding: 15px 30px;
                              text-decoration: none;
                              border-radius: 5px;
                              display: inline-block;
                              font-weight: bold;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                              max-width: 100%;
                              box-sizing: border-box;">
                        Verify Membership
                    </a>
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">
                        This verification link is specific to this member and your gym
                    </p>
                </div>
            </div>
        </div>

        <div class="footer" style="margin-top: 40px;">
            <p>Sent via GymForce</p>
            <p>Connecting People to Great Gyms</p>
        </div>
    </div>
</body>
</html>
`;

const getHubSpotHeaders = async () => {
  const token = HUBSPOT_OAUTH_ACCESS_TOKEN.value();
  if (!token) {
    throw new Error("HUBSPOT_OAUTH_ACCESS_TOKEN not set in environment");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Create transporter object using Gmail
const createTransporter = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials not set in environment");
  }
  return nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER.value(),
      pass: EMAIL_PASS.value(),
    },
  } as SMTPTransport.Options);
};

export const handleMembershipInterest = onCall<MembershipInterestData>(
  async (request) => {
    console.log("Starting handleMembershipInterest function");

    try {
      const data: MembershipInterestData = {
        userId: request.data.userId,
        userEmail: request.data.userEmail,
        userName: request.data.userName,
        userPhone: request.data.userPhone,
        gymId: request.data.gymId,
      };
      console.log("Received data:", JSON.stringify(data, null, 2));

      if (!data.userId || !data.userEmail || !data.userName || !data.gymId) {
        console.error("Missing required fields:", {
          hasUserId: !!data.userId,
          hasUserEmail: !!data.userEmail,
          hasUserName: !!data.userName,
          hasGymId: !!data.gymId,
        });
        throw new HttpsError("invalid-argument", "Missing required fields");
      }

      console.log("Getting HubSpot headers...");
      const headers = await getHubSpotHeaders();
      console.log("Successfully got HubSpot headers");

      // Get gym details from HubSpot
      console.log("Fetching gym details from HubSpot:", data.gymId);
      const gymData = await getCompanyById(data.gymId);
      console.log("Gym data from HubSpot:", JSON.stringify(gymData, null, 2));

      if (!gymData) {
        console.error("Gym not found in HubSpot:", data.gymId);
        throw new HttpsError(
          "not-found",
          `Gym not found with ID: ${data.gymId}. Please verify the gym ID is correct.`
        );
      }

      // Get associated contacts for the gym
      console.log("Fetching associated contacts for gym");
      const associationsResponse = await axios.get(
        `${HUBSPOT_COMPANIES_URL}/${data.gymId}/associations/contacts`,
        { headers }
      );
      console.log(
        "Associations response:",
        JSON.stringify(associationsResponse.data, null, 2)
      );

      if (!associationsResponse.data.results?.length) {
        console.error("No contacts found for gym");
        throw new HttpsError(
          "failed-precondition",
          "No contacts found for this gym. Please contact support."
        );
      }

      // Get the first contact's details
      const firstContactId = associationsResponse.data.results[0].id;
      console.log("Getting first contact details:", firstContactId);

      const contactResponse = await axios.get(
        `${HUBSPOT_CONTACTS_URL}/${firstContactId}?properties=email`,
        { headers }
      );
      console.log(
        "Contact details:",
        JSON.stringify(contactResponse.data, null, 2)
      );

      const contactEmail = contactResponse.data.properties.email;
      if (!contactEmail) {
        console.error("Contact has no email address");
        throw new HttpsError(
          "failed-precondition",
          "Contact email not found. Please contact support."
        );
      }
      // Generate a secure verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      console.log("Generated verification token");

      // Send email using nodemailer
      console.log("Preparing to send email");

      const emailContent = createEmailContent(
        data,
        gymData.properties.name || "your gym",
        verificationToken
      );
      const emailSubject = `New Membership Interest from ${data.userName}`;

      const transporter = await createTransporter();

      console.log("Sending email");
      const info = await transporter.sendMail({
        from: `GymForce <${EMAIL_USER.value()}>`,
        to: contactEmail,
        subject: emailSubject,
        html: emailContent,
        replyTo: data.userEmail, // Allow gym to reply directly to the prospect
      });

      console.log("Email sent successfully:", info.messageId);

      // Store email status in Firestore
      console.log("Storing email status in Firestore");

      // Create the membershipInterest document
      const emailStatus: EmailStatus = {
        // Status
        sent: true,
        sentAt: admin.firestore.Timestamp.now(),

        // User metadata
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,

        // Gym metadata
        gymId: data.gymId,
        gymName: gymData.properties.name || "",
        gymCity: gymData.properties.city,
        gymState: gymData.properties.state,

        // Email metadata
        emailSubject,
        emailContent,
        recipientEmail: contactEmail,
        recipientContactId: firstContactId,

        // Security
        verificationToken,
        verificationTokenUsed: false,
      };

      const docPath = `${data.userId}_${data.gymId}`;
      console.log("Writing to membershipInterest path:", docPath);

      // First get references to both documents
      const gymRef = admin.firestore().collection("gyms").doc(data.gymId);
      const membershipRef = admin
        .firestore()
        .collection("membershipInterest")
        .doc(docPath);

      // Create the documents in a transaction to ensure atomicity
      await admin.firestore().runTransaction(async (transaction) => {
        // First, do all reads
        console.log("Reading documents in transaction");
        const gymDoc = await transaction.get(gymRef);

        // Then, do all writes
        console.log("Performing writes in transaction");

        // Always write the membership interest status
        transaction.set(membershipRef, emailStatus);

        // Create gym document if it doesn't exist
        if (!gymDoc.exists) {
          console.log("Creating gym document in Firestore");
          transaction.set(gymRef, {
            id: data.gymId,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            hubspotId: data.gymId, // Store reference to HubSpot ID
          });
        }
      });

      console.log(
        "Successfully stored email status and ensured gym document exists"
      );
      console.log("Function completed successfully");
      return { data: { success: true, emailStatus } };
    } catch (error) {
      console.error("Error in handleMembershipInterest:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
        throw new HttpsError(
          "internal",
          `HubSpot API error (${error.response?.status}): ${
            error.response?.data?.message || error.message
          }`
        );
      } else if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        throw new HttpsError("internal", `Error: ${error.message}`);
      }
      throw new HttpsError("internal", "Unknown error occurred");
    }
  }
);
