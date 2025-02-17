import axios from "axios";
import { auth } from "./firebaseConfig";
import { EmailStatus } from "../types";

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
  gymName: string;
  gymAddress?: string;
  gymCity?: string;
  gymState?: string;
  gymDomain?: string;
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
  console.log("Starting checkMembershipInterestStatus with:", {
    userId,
    gymId,
  });
  console.log("Current auth state:", {
    currentUser: auth.currentUser?.uid,
    isAuthenticated: !!auth.currentUser,
  });

  try {
    const headers = await getAuthHeaders();
    console.log("Got auth headers:", headers);

    const response = await axios({
      method: "post",
      url: `${process.env.FIREBASE_FUNCTION_HOST_URL}/checkMembershipStatusHttp`,
      data: { data: { userId, gymId } },
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    console.log("Function response:", response.data);
    return response.data.data as EmailStatus | null;
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
  console.log("Current auth state:", {
    currentUser: auth.currentUser?.uid,
    isAuthenticated: !!auth.currentUser,
  });

  try {
    const headers = await getAuthHeaders();
    console.log("Got auth headers:", headers);

    const response = await axios({
      method: "post",
      url: `${process.env.FIREBASE_FUNCTION_HOST_URL}/claimMembershipHttp`,
      data: { data: { userId, gymId } },
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    console.log("Function response:", response.data);
    return response.data;
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
