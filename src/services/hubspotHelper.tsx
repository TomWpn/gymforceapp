// src/services/hubspotHelper.ts
import axios from "axios";
import { auth } from "./firebaseConfig";
import { Company } from "../types";

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

export const createCompanyInHubSpot = async (companyData: Company) => {
  const headers = await getAuthHeaders();
  try {
    const response = await axios.post(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/createCompanySecondGen`,
      { ...companyData.properties },
      { headers }
    );
    return response.data.company;
  } catch (error: any) {
    console.error(
      "Error creating company:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create company in HubSpot");
  }
};
