// src/services/gymService.ts
import axios from "axios";
import { auth } from "./firebaseConfig";
import { Company } from "../types";
import { Alert, Linking } from "react-native";

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
    console.log("Response from Firebase function:", response.data.facilities);
    // Return the grouped list of gym facilities
    return response.data.facilities;
  } catch (error: any) {
    console.error("Error fetching gyms:", error?.response?.data || error);
    throw new Error("Failed to fetch gyms.");
  }
};

export const handleOpenMap = (gym: Company) => {
  if (!gym?.properties.address || !gym?.properties.city) {
    // Alert.alert("Location unavailable", "No address found for this gym.");
    return;
  }

  const address = `${gym.properties.address}, ${gym.properties.city}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Alert.alert("Error", "Unable to open the maps app.");
      }
    })
    .catch((err) => console.error("Error opening map:", err));
};

/**
 * Fetches gym details from Firebase by gym ID.
 * @param companyId - The ID of the gym (HubSpot company ID).
 * @returns The latest gym data from HubSpot.
 */
export const fetchGymById = async (companyId: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const idToken = await user.getIdToken();
  try {
    const response = await axios.get(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/getCompanyByIdSecondGen?companyId=${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.data.company;
  } catch (error: any) {
    console.error(
      "Error fetching gym data from HubSpot:",
      error?.response?.data || error
    );
    throw new Error("Failed to fetch gym data.");
  }
};
