import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { EmailStatus } from "../types/gymforce";

const renderPage = (title: string, message: string, isError = false) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gym Force® - ${title}</title>
    <style>
        @font-face {
            font-family: 'VTFRedzone';
            src: url('https://gymforce.app/assets/fonts/VTFRedzone-Classic.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: 'OpenSans';
            src: url('https://gymforce.app/assets/fonts/OpenSans-VariableFont_wdth,wght.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        :root {
            --navy: #1a265a;
            --orange: #f1600d;
            --light-navy: #f5f6f9;
            --error-red: #dc3545;
            --success-green: #28a745;
        }
        body {
            font-family: 'OpenSans', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: var(--light-navy);
        }
        .gym-force {
            font-family: 'VTFRedzone', sans-serif;
        }
        h1 {
            font-family: 'VTFRedzone', sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            flex-grow: 1;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 40px;
            width: auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: var(--navy);
        }
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        .message {
            padding: 25px;
            border-radius: 8px;
            background: ${isError ? "#fff5f5" : "#f6fbf6"};
            border: 1px solid ${
              isError ? "var(--error-red)" : "var(--success-green)"
            };
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.6;
        }
        .status-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: ${isError ? "#fff5f5" : "#f6fbf6"};
            border: 2px solid ${
              isError ? "var(--error-red)" : "var(--success-green)"
            };
        }
        .status-icon svg {
            width: 32px;
            height: 32px;
            fill: ${isError ? "var(--error-red)" : "var(--success-green)"};
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: var(--navy);
            font-size: 14px;
            margin-top: auto;
        }
        .button {
            display: inline-block;
            background: var(--orange);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 20px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background: #e14d00;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://gymforce.app/assets/images/badge.png" alt="Gym Force® Logo">
        </div>
        <div class="header">
            <div class="status-icon">
                ${
                  isError
                    ? '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
                    : '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
                }
            </div>
            <h1>${title}</h1>
        </div>
        <div class="message">
            ${message}
        </div>
        <div style="text-align: center;">
            <a href="https://gymforce.app" class="button">Return to <span class="gym-force">Gym Force®</span></a>
        </div>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} <span class="gym-force">Gym Force®</span>. All rights reserved.</p>
    </div>
</body>
</html>
`;

export const verifyMembershipHttp = onRequest(async (request, response) => {
  console.log("Starting verifyMembershipHttp function");

  if (request.method !== "GET") {
    response
      .status(405)
      .send(
        renderPage(
          "Method Not Allowed",
          "This endpoint only accepts GET requests.",
          true
        )
      );
    return;
  }

  try {
    const userId = request.query.userId as string;
    const gymId = request.query.gymId as string;
    const token = request.query.token as string;

    console.log("Received verification request from query params:", {
      userId,
      gymId,
    });

    if (!userId || !gymId || !token) {
      console.error("Invalid or missing query parameters");
      response
        .status(400)
        .send(
          renderPage(
            "Invalid Request",
            "The verification link appears to be invalid. Please check your email for the correct link or contact support.",
            true
          )
        );
      return;
    }

    const membershipRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("membershipInterest")
      .doc(gymId);

    const doc = await membershipRef.get();
    if (!doc.exists) {
      response
        .status(404)
        .send(
          renderPage(
            "Not Found",
            "No membership request was found. Please check your email for the correct link or contact support.",
            true
          )
        );
      return;
    }

    const membershipData = doc.data() as EmailStatus;

    console.log("Checking verification token status");

    // Verify the token
    if (membershipData.verificationToken !== token) {
      console.error("Invalid verification token provided");
      response
        .status(403)
        .send(
          renderPage(
            "Invalid Token",
            "This verification link appears to be invalid. Please check your email for the correct link or contact support.",
            true
          )
        );
      return;
    }

    if (membershipData.verificationTokenUsed) {
      console.log("Token has already been used");
      response
        .status(400)
        .send(
          renderPage(
            "Already Verified",
            `This membership has already been verified on ${membershipData.gymVerifiedMembershipAt
              ?.toDate()
              .toLocaleDateString()}. No further action is needed.`,
            true
          )
        );
      return;
    }

    console.log("Token validation successful, proceeding with verification");

    // Update the membership status and mark token as used
    await membershipRef.update({
      gymVerifiedMembership: true,
      gymVerifiedMembershipAt: admin.firestore.Timestamp.now(),
      verificationTokenUsed: true,
    });

    console.log("Successfully verified membership");

    response
      .status(200)
      .send(
        renderPage(
          "Verification Successful",
          `Thank you for verifying ${membershipData.userName}'s membership request. Our team will review both the gym verification and member confirmation to complete the process.`,
          false
        )
      );
  } catch (error) {
    console.error("Error in verifyMembershipHttp:", error);
    response
      .status(500)
      .send(
        renderPage(
          "Error",
          "An unexpected error occurred while verifying the membership. Please try again or contact support.",
          true
        )
      );
  }
});
