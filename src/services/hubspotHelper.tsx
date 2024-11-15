// src/services/hubspotHelper.ts
import axios from "axios";
import { auth } from "./firebaseConfig";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
};

export const fetchGymFromHubSpot = async (companyId: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${process.env.FIREBASE_FUNCTION_HOST_URL}/getCompanyByIdSecondGen?companyId=${companyId}`,
    { headers }
  );
  return response.data.company;
};
