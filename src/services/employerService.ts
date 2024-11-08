// src/services/employerService.ts
import axios from "axios";
import { auth } from "./firebaseConfig";

/**
 * Fetches employers from the backend using a search query.
 *
 * This function authenticates the user, sanitizes the query, and sends a request
 * to the Firebase function endpoint specifically for employer searches.
 *
 * @param query - The search term to look for employers by name
 * @returns An array of employer data or throws an error if the request fails
 */
export const fetchEmployers = async (query: string) => {
  // Ensure the user is authenticated
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get the ID token for the authenticated user
  const idToken = await user.getIdToken();
  const sanitizedQuery = encodeURIComponent(query.trim());

  // Construct and send the request
  try {
    const response = await axios.get(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/searchEmployersSecondGen?q=${sanitizedQuery}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`, // Include ID token in the request headers
        },
      }
    );

    // Return the array of employer results
    return response.data.results;
  } catch (error: any) {
    console.error("Error fetching employers:", error?.response?.data || error);
    throw new Error("Failed to fetch employers.");
  }
};
