import axios from "axios";
import { auth, firestore } from "./firebaseConfig";
import { EmailStatus } from "../types";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    // Return empty headers for anonymous users
    return {};
  }
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
};

interface MembershipInterestData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  gymId: string;
}

export const sendMembershipInterest = async (data: MembershipInterestData) => {
  console.log(
    "Starting sendMembershipInterest with data:",
    JSON.stringify(data, null, 2)
  );

  try {
    const headers = await getAuthHeaders();
    const response = await axios({
      method: "post",
      url: `${process.env.FIREBASE_FUNCTION_HOST_URL}/handleMembershipInterest`,
      data: { data },
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    console.log(
      "Cloud function response:",
      JSON.stringify(response.data, null, 2)
    );
    return response.data.result as {
      success: boolean;
      emailStatus: EmailStatus;
    };
  } catch (error) {
    console.error("Error sending membership interest:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

export const checkMembershipInterestStatus = async (
  userId: string,
  gymId: string
) => {
  console.log("Checking membership interest status:", { userId, gymId });

  try {
    const docPath = `${userId}_${gymId}`;
    console.log("Fetching document from path:", docPath);

    const docRef = doc(firestore, "membershipInterest", docPath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as EmailStatus;
      console.log(
        "Found membership interest status:",
        JSON.stringify(data, null, 2)
      );
      return data;
    }

    console.log("No membership interest status found");
    return null;
  } catch (error) {
    console.error("Error checking membership interest status:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

export const claimMembership = async (userId: string, gymId: string) => {
  console.log("Starting claimMembership with:", { userId, gymId });

  try {
    const docPath = `${userId}_${gymId}`;
    const docRef = doc(firestore, "membershipInterest", docPath);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create a new membership interest document if it doesn't exist
      await setDoc(docRef, {
        userId,
        gymId,
        userClaimedMembership: true,
        userClaimedMembershipAt: new Date(),
        sent: false, // No email sent yet
      });
    } else {
      // Update existing document
      await updateDoc(docRef, {
        userClaimedMembership: true,
        userClaimedMembershipAt: new Date(),
      });
    }

    console.log("Successfully claimed membership");
    return { success: true, message: "Membership claimed successfully" };
  } catch (error) {
    console.error("Error claiming membership:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};
