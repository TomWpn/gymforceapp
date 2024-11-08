// src/services/gymService.ts
import axios from "axios";
import { auth } from "./firebaseConfig";

/**
 * Fetches gyms from the backend within a specified range from a location.
 *
 * This function authenticates the user, sanitizes the location query, and
 * sends a request to the Firebase function endpoint specifically for gym facilities.
 *
 * @param lat - Latitude of the location to search around
 * @param lng - Longitude of the location to search around
 * @param range - Distance range in miles to filter gyms by proximity
 * @returns A grouped list of gym facilities or throws an error if the request fails
 */
export const fetchGyms = async (lat: number, lng: number, range: number) => {
  // Ensure the user is authenticated
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get the ID token for the authenticated user
  const idToken = await user.getIdToken();

  // Construct and send the request
  try {
    const response = await axios.get(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/getNearbyFacilitiesSecondGen?lat=${lat}&lng=${lng}&range=${range}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`, // Include ID token in the request headers
        },
      }
    );
    console.log("Response from Firebase function:", response.data);
    // Return the grouped list of gym facilities
    return response.data.facilities;
  } catch (error: any) {
    console.error("Error fetching gyms:", error?.response?.data || error);
    throw new Error("Failed to fetch gyms.");
  }
};
