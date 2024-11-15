// src/services/gymService.ts
import { fetchGymFromHubSpot } from "./hubspotHelper";
import { getGymFromFirestore, addReviewToFirestore } from "./firebaseHelper";
import axios from "axios";
import { auth } from "./firebaseConfig";
import { Alert, Linking } from "react-native";
import { GymReview } from "../types";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
};

/**
 * Fetches gyms within a specified range of a location.
 */
export const fetchGyms = async (lat: number, lng: number, range: number) => {
  const headers = await getAuthHeaders();

  try {
    const response = await axios.get(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/getNearbyFacilitiesSecondGen?lat=${lat}&lng=${lng}&range=${range}`,
      { headers }
    );
    return response.data.facilities;
  } catch (error: any) {
    console.error("Error fetching gyms:", error?.response?.data || error);
    throw new Error("Failed to fetch gyms.");
  }
};

/**
 * Opens Google Maps to the gym's location.
 */
export const handleOpenMap = (gym: any) => {
  if (!gym?.properties.address || !gym?.properties.city) {
    Alert.alert("Location unavailable", "No address found for this gym.");
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
        Alert.alert("Error", "Unable to open the maps app.");
      }
    })
    .catch((err) => console.error("Error opening map:", err));
};

/**
 * Fetches and combines gym data from Firestore and HubSpot.
 * @param gymId - The ID of the gym.
 * @returns Combined gym data with Firestore and HubSpot fields.
 */
export const getGymDetails = async (gymId: string) => {
  const [firestoreData, hubSpotData] = await Promise.all([
    getGymFromFirestore(gymId),
    fetchGymFromHubSpot(gymId),
  ]);

  // Merge Firestore and HubSpot data, prioritizing HubSpot data where applicable
  const combinedData = {
    ...firestoreData,
    ...hubSpotData,
  };
  console.log("Combined Data:", combinedData);
  return combinedData;
};

/**
 * Adds a review to Firestore for the specified gym.
 * @param gymId - The ID of the gym.
 * @param userId - The ID of the user submitting the review.
 * @param rating - The rating given by the user.
 * @param comment - Comment provided by the user.
 * @param ownerNote - Optional note to the gym owner.
 */
export const addGymReview = async (reviewData: GymReview) => {
  await addReviewToFirestore(reviewData);
};
